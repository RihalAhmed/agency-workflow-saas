import fs from "fs";
import path from "path";
import { validateDesign } from "../src/lib/schema/validate-design";

function main() {
  const templatesDir = path.resolve(process.cwd(), "src/templates");
  
  if (!fs.existsSync(templatesDir)) {
    console.error(`Templates directory not found: ${templatesDir}`);
    process.exit(1);
  }

  const designs = fs.readdirSync(templatesDir).filter((file) => {
    return fs.statSync(path.join(templatesDir, file)).isDirectory();
  });

  let hasErrors = false;
  let checkedCount = 0;

  for (const designId of designs) {
    const schemaPath = path.join(templatesDir, designId, "schema.json");
    if (!fs.existsSync(schemaPath)) {
      // Not a formal design directory or hasn't been migrated yet
      continue;
    }

    checkedCount++;
    console.log(`Validating design: ${designId}...`);

    try {
      const raw = fs.readFileSync(schemaPath, "utf8");
      const schemaData = JSON.parse(raw);
      
      const result = validateDesign(designId, schemaData);
      
      if (result.valid) {
        console.log(`✅ ${designId} passed validation.\n`);
      } else {
        console.error(`❌ ${designId} failed validation:`);
        result.errors.forEach((err) => console.error(`  - ${err}`));
        console.error();
        hasErrors = true;
      }
    } catch (e: any) {
      console.error(`❌ Error reading ${schemaPath}: ${e.message}\n`);
      hasErrors = true;
    }
  }

  if (checkedCount === 0) {
    console.warn("No schema.json files found to validate.");
  }

  if (hasErrors) {
    console.error("Validation failed. See errors above.");
    process.exit(1);
  } else {
    console.log("All designs passed validation.");
    process.exit(0);
  }
}

main();
