import { DesignSchema } from "./design-schema";
import fs from "fs";
import path from "path";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a design's schema.json against the DesignSchema contract
 * and performs cross-reference validation (e.g., ensuring all editable
 * fields reference real sections).
 */
export function validateDesign(
  designId: string,
  schemaRaw: unknown
): ValidationResult {
  const errors: string[] = [];

  // 1. Zod schema validation
  const parseResult = DesignSchema.safeParse(schemaRaw);
  if (!parseResult.success) {
    (parseResult.error as any).errors.forEach((e: any) => {
      errors.push(`Schema Error at ${e.path.join(".")}: ${e.message}`);
    });
    return { valid: false, errors };
  }

  const schema = parseResult.data;

  // Ensure ID matches folder
  if (schema.id !== designId) {
    errors.push(`Schema ID "${schema.id}" does not match folder name "${designId}"`);
  }

  const sectionIds = new Set(schema.sections.map((s) => s.id));
  const sectionTypes = new Set(schema.sections.map((s) => s.type));

  // 2. Cross-check editable fields against sections
  schema.editable_fields.forEach((field) => {
    if (!sectionIds.has(field.section)) {
      errors.push(
        `Editable field "${field.id}" references unknown section "${field.section}"`
      );
    }
  });

  // 3. Cross-check image slots against sections
  schema.image_slots.forEach((slot) => {
    if (!sectionIds.has(slot.section)) {
      errors.push(
        `Image slot "${slot.id}" references unknown section "${slot.section}"`
      );
    }
  });

  // 4. Verify component files exist in the design's sections/ folder
  const sectionsDir = path.resolve(
    process.cwd(),
    `src/templates/${designId}/sections`
  );
  if (fs.existsSync(sectionsDir)) {
    const files = fs.readdirSync(sectionsDir).map((f) => f.replace(/\.tsx?$/, ""));
    const exportedComponents = new Set(files);

    sectionTypes.forEach((type) => {
      // Convention: component name should be PascalCase version of type,
      // but for simplicity we check if a file with exact name or PascalCase name exists.
      const pascalCase = type.charAt(0).toUpperCase() + type.slice(1);
      if (!exportedComponents.has(pascalCase) && !exportedComponents.has(type)) {
        errors.push(
          `Section type "${type}" has no corresponding component file (expected ${pascalCase}.tsx)`
        );
      }
    });
  } else {
    errors.push(`Sections directory missing: ${sectionsDir}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
