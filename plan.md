1. **Checkout Flow (`src/pages/checkout/CheckoutAddress.tsx`, `src/pages/checkout/CheckoutPayment.tsx`)**:
   - `CheckoutAddress.tsx`:
     - Add `rounded-2xl` to the main address editing form (`<form className="... bg-muted/30 p-6 border border-border">`).
     - Add `rounded-full` to the primary action buttons (`"ذخیره آدرس"`, `"افزودن آدرس"`, `"مرحله بعد"`).
     - Add `rounded-2xl` to the address selection cards (`<div className="relative border p-6...">`).
     - Add `rounded-2xl` to the empty address state box (`<div className="text-center py-12 border border-border">`).
     - Add `rounded-2xl` to shipping method boxes (`<label className="flex items-center justify-between p-6 border...">`).
     - Add `rounded-full` to `"افزودن آدرس دیگر"` and `"لغو"` buttons.
   - `CheckoutPayment.tsx`:
     - Add `rounded-2xl` to the Order Summary box (`<div className="bg-muted/30 p-6 border border-border sticky top-24">`).
     - Add `rounded-2xl` to the Wallet and Gateway payment method boxes (`<div className="border p-6">`).
     - Add `rounded-full` to the primary action buttons (`"پرداخت از کیف پول"`, `"پرداخت از طریق درگاه"`).

2. **User Account Pages**:
   - `src/components/account/AccountLayout.tsx`:
     - Add `rounded-2xl` to the `max-w-6xl` wrapper or the section holding the content/sidebar if appropriate. Specifically to the section: `<section className="bg-background border border-border p-6 md:p-10...">`.
     - Add `rounded-2xl` to the sidebar navigation wrapper: `<nav>`'s `<ul>` (`<ul className="... bg-background border border-border p-2">`).
     - Add `rounded-full` or `rounded-xl` to the `NavLink` items and the "خروج از حساب" button.
   - `src/pages/account/Addresses.tsx`:
     - Add `rounded-2xl` to the empty address state (`<div className="text-center py-12">`).
     - Add `rounded-2xl` to address cards (`<article className="border border-border p-6...">`).
     - Add `rounded-full` to buttons (`"ذخیره آدرس"`, `"لغو"`, `"افزودن آدرس"`, `"افزودن آدرس دیگر"`).
   - *Note*: Ensure the generic input fields in `src/components/auth/FormField.tsx` are also rounded. Check `FormField.tsx` and add `rounded-lg` or `rounded-xl`. Let me double-check `FormField.tsx`.

3. **Product Details Page (`src/pages/ProductDetail.tsx`)**:
   - Add `rounded-2xl` to the main product image container (`<div className="w-full aspect-[4/5] bg-warm-bg overflow-hidden relative">`).
   - Add `rounded-2xl` to thumbnail buttons (`<button className="flex-shrink-0 w-24 h-24 border...">`).
   - Add `rounded-full` to the variant selector buttons (Size/Color) (`<button className="px-4 py-2 text-sm border...">`).
   - Add `rounded-full` to the "Add To Cart" / "Sold Out" button.

4. **Cart Page (`src/pages/Cart.tsx`)**:
   - Add `rounded-full` to the "ادامه خرید" (Continue Shopping) button.
   - Add `rounded-full` to the "تسویه حساب" (Checkout) button.
   - Add `rounded-2xl` to the product image in cart items (`<img className="w-24 h-24 object-cover...">`).

5. **Pre-commit and Test**:
   - Run linter and type checks. Ensure the UI still looks consistent.
