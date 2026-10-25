import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Exercise the real TS actions/components with isolated dependencies. No network
// or Supabase connection is used, so these tests cannot modify production data.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function loader(stubs = {}) {
  const cache = new Map();
  function load(file) {
    const filename = path.resolve(root, file);
    if (cache.has(filename)) return cache.get(filename).exports;
    const mod = new Module(filename);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    cache.set(filename, mod);
    const normalRequire = mod.require.bind(mod);
    mod.require = (id) => {
      if (Object.hasOwn(stubs, id)) return stubs[id];
      if (id.startsWith("@/")) {
        const base = path.join(root, id.slice(2));
        for (const extension of [".ts", ".tsx"]) {
          if (fs.existsSync(base + extension)) return load(base + extension);
        }
      }
      return normalRequire(id);
    };
    const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
      fileName: filename,
    }).outputText;
    mod._compile(output, filename);
    return mod.exports;
  }
  return load;
}

const customer = {
  name: "Test Customer", phone: "0123456789", email: "",
  address: "10 Jalan Test, Alor Setar", notes: "", locationPin: "",
};
const summary = {
  order_number: "TM-TEST-001", payment_method: "pay_now",
  payment_status: "unpaid", status: "pending", total: 32,
  subtotal: 26, delivery_fee: 6,
  items: [{ name: "Test jar", quantity: 2, unit_price: 13, subtotal: 26 }],
};
const input = {
  customer, items: [{ productId: "test-product", quantity: 2 }],
  idempotencyKey: "test-idempotency-key", paymentMethod: "pay_now",
};

test("manual QR accepts no email and uses the database total without a gateway", async () => {
  let calls = 0;
  const load = loader({
    "@/lib/supabase/config": { isSupabaseConfigured: true },
    "@/lib/supabase/server": { createClient: async () => ({
      rpc: async (name, args) => {
        calls++;
        assert.equal(name, "create_order");
        assert.equal(args.p_payment_method, "pay_now");
        assert.equal(args.p_customer_email, null);
        assert.equal(args.p_idempotency_key, input.idempotencyKey);
        assert.equal(Object.hasOwn(args, "total"), false);
        assert.equal(Object.hasOwn(args, "payment_status"), false);
        return { data: summary, error: null };
      },
    }) },
  });
  const result = await load("app/checkout/actions.ts").createOrder(input);
  assert.equal(result.ok, true);
  assert.equal(result.order.total, 32);
  assert.equal(result.order.paymentStatus, "unpaid");
  assert.equal(Object.hasOwn(result, "paymentUrl"), false);
  assert.equal(calls, 1);
});

test("invalid COD and invalid cart are rejected before any database call", async () => {
  const load = loader({
    "@/lib/supabase/config": { isSupabaseConfigured: true },
    "@/lib/supabase/server": { createClient: async () => { throw new Error("Unexpected database call"); } },
  });
  const { createOrder } = load("app/checkout/actions.ts");
  const cod = await createOrder({ ...input, paymentMethod: "cod" });
  assert.equal(cod.ok, false);
  assert.match(cod.message, /Kulim/);
  assert.equal((await createOrder({ ...input, items: [] })).code, "EMPTY_CART");
});

test("stock/database failures return safe errors without a false confirmation", async () => {
  const load = loader({
    "@/lib/supabase/config": { isSupabaseConfigured: true },
    "@/lib/supabase/server": { createClient: async () => ({
      rpc: async () => ({ data: null, error: { message: "STOK_TIDAK_CUKUP private detail" } }),
    }) },
  });
  const result = await load("app/checkout/actions.ts").createOrder(input);
  assert.equal(result.ok, false);
  assert.equal(result.code, "INSUFFICIENT_STOCK");
  assert.doesNotMatch(result.message, /private detail/);
});

test("QR/COD delivery fees and initial payment states remain unchanged", () => {
  const delivery = loader()("lib/delivery.ts");
  for (const quantity of [1, 4]) {
    assert.equal(delivery.calculateDeliveryFee(quantity, "pay_now"), 6);
    assert.equal(delivery.calculateDeliveryFee(quantity, "cod"), 2);
  }
  for (const method of ["pay_now", "cod"]) {
    assert.equal(delivery.calculateDeliveryFee(5, method), 0);
  }
  assert.equal(delivery.paymentStatusFor("pay_now"), "unpaid");
  assert.equal(delivery.paymentStatusFor("cod"), "pending");
});

test("confirmation retains the saved total and reference after a session refresh", () => {
  const previousWindow = global.window;
  const storage = new Map();
  global.window = { sessionStorage: {
    setItem(key, value) { storage.set(key, value); },
    getItem(key) { return storage.get(key) ?? null; },
  } };
  try {
    const checkout = loader()("lib/checkout.ts");
    const order = { orderNumber: "TM-TEST-001", total: 32, items: [] };
    checkout.saveOrderConfirmation(order);
    const refreshed = loader()("lib/checkout.ts").loadOrderConfirmation(order.orderNumber);
    assert.equal(refreshed.orderNumber, order.orderNumber);
    assert.equal(refreshed.total, order.total);
  } finally { global.window = previousWindow; }
});

test("QR render shows the saved amount, original asset, download and pending copy", () => {
  const load = loader({
    "next/image": { __esModule: true, default: (imageProps) => {
      const props = { ...imageProps };
      delete props.unoptimized;
      return React.createElement("img", props);
    } },
  });
  const { DuitNowPayment } = load("components/checkout/duitnow-payment.tsx");
  const html = renderToStaticMarkup(React.createElement(DuitNowPayment, {
    orderNumber: summary.order_number, total: summary.total,
  }));
  assert.match(html, /Awaiting payment verification/);
  assert.match(html, /RM\s*32\.00/);
  assert.match(html, /TM-TEST-001/);
  assert.match(html, /src="\/duitnow-qr.jpg"/);
  assert.match(html, /download="TokMieja-DuitNow-QR.jpg"/);
  assert.match(html, /Pay exactly/);
  assert.match(html, /Enter this amount/);
  assert.doesNotMatch(html, /Payment Successful/i);
});

function checkoutHarness(createOrder) {
  const states = [];
  const events = [];
  let hook = 0;
  const realCheckout = loader()("lib/checkout.ts");
  const load = loader({
    react: {
      useState(initial) {
        const index = hook++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (next) => {
          states[index] = typeof next === "function" ? next(states[index]) : next;
        }];
      },
      useRef(initial) {
        const index = hook++;
        if (!(index in states)) states[index] = { current: initial };
        return states[index];
      },
    },
    "next/navigation": { useRouter: () => ({ push: (url) => events.push(["navigate", url]) }) },
    "@/lib/use-is-client": { useIsClient: () => true },
    "@/components/cart/cart-provider": { useCart: () => ({
      items: [{ productId: "test-product", name: "Test jar", price: 13, quantity: 2 }],
      subtotal: 26, clearCart: () => events.push(["clear"]),
    }) },
    "@/lib/checkout": { ...realCheckout, saveOrderConfirmation: (order) => events.push(["save", order]) },
    "./actions": { createOrder },
  });
  const { CheckoutFlow } = load("app/checkout/checkout-flow.tsx");
  function render() { hook = 0; return CheckoutFlow(); }
  function find(node, predicate) {
    if (!node || typeof node !== "object") return null;
    if (predicate(node)) return node;
    const children = React.Children.toArray(node.props?.children);
    for (const child of children) {
      const found = find(child, predicate);
      if (found) return found;
    }
    return null;
  }
  function component(name) { return find(render(), (node) => node.type?.name === name); }
  function fillDetails(address = customer.address) {
    for (const [field, value] of Object.entries({ name: customer.name, phone: customer.phone, address })) {
      component("CustomerForm").props.onChange(field, value);
    }
  }
  function review() {
    find(render(), (node) => node.props?.children === "Continue to review").props.onClick();
    return component("ReviewOrder");
  }
  return { events, component, fillDetails, review };
}

test("checkout failure retains the cart and retries with the same idempotency key", async () => {
  const keys = [];
  const harness = checkoutHarness(async (payload) => {
    keys.push(payload.idempotencyKey);
    return { ok: false, message: "Not enough stock" };
  });
  harness.fillDetails();
  await harness.review().props.onConfirm();
  assert.deepEqual(harness.events, []);
  assert.equal(harness.component("ReviewOrder").props.error, "Not enough stock");
  await harness.component("ReviewOrder").props.onConfirm();
  assert.equal(keys.length, 2);
  assert.equal(keys[0], keys[1]);
});

test("successful checkout saves confirmation before clearing the cart and redirects locally", async () => {
  const order = { orderNumber: "TM-TEST-001", paymentMethod: "pay_now", paymentStatus: "unpaid", total: 32 };
  const harness = checkoutHarness(async () => ({ ok: true, order }));
  harness.fillDetails();
  await harness.review().props.onConfirm();
  assert.deepEqual(harness.events, [
    ["save", order], ["clear"], ["navigate", "/order-confirmation/TM-TEST-001"],
  ]);
});

test("changing a Kulim COD address to a non-Kulim address switches to QR and RM6 delivery", () => {
  const harness = checkoutHarness(async () => { throw new Error("Not submitted"); });
  harness.fillDetails("10 Jalan Test, Kulim, Kedah");
  assert.equal(harness.component("PaymentMethodSelect").props.codAvailable, true);
  harness.component("PaymentMethodSelect").props.onChange("cod");
  harness.component("CustomerForm").props.onChange("address", customer.address);
  const review = harness.review();
  assert.equal(review.props.paymentMethod, "pay_now");
  assert.equal(review.props.deliveryFee, 6);
});
