import fs from "fs";
import path from "path";

export const loadTemplate = (templateName, variables = {}) => {
  const filePath = path.join(process.cwd(), "templates", `${templateName}.html`);
  let template = fs.readFileSync(filePath, "utf-8");

  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, "g");
    template = template.replace(regex, variables[key]);
  });

  return template;
};
