# Disabled wizard steps

Steps that were built, then switched off in the product — kept here (not
deleted) so they can be brought back without being rewritten. Nothing in this
folder is imported by the running app.

## `ManagersStep.tsx` — موظفين المتجر

Collects store managers (email + job title + status) and returns
`StoreManagersValues`.

### Re-enabling it

1. `create/products/types.ts` — add `"managers"` to `ProductWizardStepId` and
   insert `{ id: "managers", label: "موظفين المتجر" }` into
   `PRODUCT_WIZARD_STEPS` (it used to sit between `contact` and
   `workingHours`).
2. `CreateProductStorePage.tsx` — move the file out of `disabled/`, import it,
   and add a `case "managers"` to `renderStep()`:

   ```tsx
   case "managers":
     return (
       <ManagersStep
         initialData={data.managers}
         onNext={(values) => {
           setData((prev) => ({ ...prev, managers: values }));
           goToStep("workingHours");
         }}
         onBack={() => goToStep("contact")}
         steps={steps}
         currentStepNumber={currentStepNumber}
       />
     );
   ```

3. `CreateProductStorePage.tsx` — point `handleContactNext` at
   `goToStep("managers")`, and `WorkingHoursStep`'s `onBack` back at
   `goToStep("managers")`.
4. `CreateProductStorePage.tsx` — in `handleSave`, send the collected managers
   instead of the empty array: `managers: data.managers?.managers ?? []`.

The wizard's step numbering is derived from `PRODUCT_WIZARD_STEPS`, so the
progress bar needs no manual renumbering.
