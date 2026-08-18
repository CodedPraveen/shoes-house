function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}

function AddressField({
  field,
  label,
  placeholder,
  value,
  onChange,
  error,
  className = "",
  required = false,
  inputMode,
  maxLength,
  autoComplete,
}) {
  const errorId = `${field}-error`;

  return (
    <label className={className}>
      <span className="mb-1.5 block text-xs font-medium text-black/70">
        {label}
        {required ? <span className="ml-1 text-red-600" aria-hidden="true">*</span> : null}
        {!required ? <span className="ml-1 font-normal text-black/40">(optional)</span> : null}
      </span>
      <input
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value || ""}
        onChange={(event) => onChange(field, event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`h-11 w-full rounded-xl border bg-white px-4 text-sm outline-none ring-black/20 focus:ring-2 ${
          error ? "border-red-500" : "border-black/15"
        }`}
      />
      <FieldError id={errorId} message={error} />
    </label>
  );
}

export default function AddressFields({ form, errors = {}, onChange, showLabel = false }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {showLabel ? (
        <AddressField
          field="label"
          label="Save this address as"
          placeholder="Home, Work, Other"
          value={form.label}
          onChange={onChange}
          error={errors.label}
          className="sm:col-span-2"
          autoComplete="off"
        />
      ) : null}
      <AddressField
        field="fullName"
        label="Name"
        placeholder="Recipient's full name"
        value={form.fullName}
        onChange={onChange}
        error={errors.fullName}
        required
        autoComplete="name"
      />
      <AddressField
        field="phone"
        label="Phone"
        placeholder="10-digit mobile number"
        value={form.phone}
        onChange={(field, value) => onChange(field, value.replace(/\D/g, "").slice(0, 10))}
        error={errors.phone}
        required
        inputMode="numeric"
        maxLength={10}
        autoComplete="tel"
      />
      <AddressField
        field="line1"
        label="Address 1"
        placeholder="Road, street, or main location"
        value={form.line1}
        onChange={onChange}
        error={errors.line1}
        className="sm:col-span-2"
        required
        autoComplete="address-line1"
      />
      <AddressField
        field="line2"
        label="Area / Locality"
        placeholder="Area or locality"
        value={form.line2}
        onChange={onChange}
        error={errors.line2}
        className="sm:col-span-2"
        autoComplete="address-line2"
      />
      <AddressField
        field="city"
        label="City / Town / Village"
        placeholder="City, town, or village"
        value={form.city}
        onChange={onChange}
        error={errors.city}
        required
        autoComplete="address-level2"
      />
      <AddressField
        field="state"
        label="State"
        placeholder="State"
        value={form.state}
        onChange={onChange}
        error={errors.state}
        required
        autoComplete="address-level1"
      />
      <AddressField
        field="pincode"
        label="PIN Code"
        placeholder="6-digit PIN code"
        value={form.pincode}
        onChange={(field, value) => onChange(field, value.replace(/\D/g, "").slice(0, 6))}
        error={errors.pincode}
        required
        inputMode="numeric"
        maxLength={6}
        autoComplete="postal-code"
      />
      <AddressField
        field="country"
        label="Country"
        placeholder="India"
        value={form.country}
        onChange={onChange}
        error={errors.country}
        required
        autoComplete="country-name"
      />
    </div>
  );
}
