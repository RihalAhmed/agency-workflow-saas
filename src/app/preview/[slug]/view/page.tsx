import React from "react";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { SiteSpec } from "@/lib/spec/site-spec";
import { getTemplate } from "@/templates/registry";
import { tokenStyle } from "@/lib/render/token-style";
import { resolveSectionProps } from "@/lib/render/resolve";
import { EditableWrapper } from "@/lib/editor/EditableWrapper";

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function ViewPage({ params, searchParams }: PreviewPageProps) {
  const { slug } = await params;
  const { edit } = await searchParams;
  const isEditMode = edit === "true";
  
  const prospectsDir = path.join(process.cwd(), "data/prospects");
  const filePath = path.join(prospectsDir, `${slug}.json`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  const siteSpec = SiteSpec.parse(JSON.parse(fileContent));

  const template = await getTemplate(siteSpec.templateId);

  if (!template) {
    return <div>Template not found: {siteSpec.templateId}</div>;
  }

  return (
    <div style={tokenStyle(siteSpec.tokens)} className="font-body text-ink antialiased bg-surface min-h-screen">
      {siteSpec.sections.map((section, idx) => {
        const SectionComponent = template.sections[section.type];
        if (!SectionComponent) return null;

        const resolvedProps = resolveSectionProps(section, siteSpec);

        if (isEditMode) {
          return (
            <EditableWrapper key={idx} slug={slug} sectionId={section.type} sectionType={section.type} initialContent={section.content}>
              <SectionComponent {...resolvedProps} />
            </EditableWrapper>
          );
        }

        return <SectionComponent key={idx} {...resolvedProps} />;
      })}
    </div>
  );
}
