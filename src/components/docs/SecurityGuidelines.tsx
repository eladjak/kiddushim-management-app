
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const SecurityGuidelines = () => {
  const [markdown, setMarkdown] = useState<string>("");

  useEffect(() => {
    // Fetch the security guidelines markdown file
    fetch("/src/docs/SecurityGuidelines.md")
      .then((response) => response.text())
      .then((text) => {
        setMarkdown(text);
      })
      .catch((error) => {
        console.error("Error loading security guidelines:", error);
      });
  }, []);

  // Split content to Hebrew and English sections
  const splitContent = () => {
    const sections = markdown.split("## ");
    
    // Remove the header
    const cleanSections = sections.filter((section, index) => index > 0);
    
    return cleanSections.map((section) => {
      const [title, ...content] = section.split("\n");
      
      // Extract Hebrew and English content
      const hebrewContent = [];
      const englishContent = [];
      
      let isHebrew = true;
      
      for (const line of content) {
        if (line.trim() === "### English") {
          isHebrew = false;
          continue;
        }
        
        if (line.trim() === "### עברית") {
          isHebrew = true;
          continue;
        }
        
        if (isHebrew) {
          hebrewContent.push(line);
        } else {
          englishContent.push(line);
        }
      }
      
      return {
        title,
        hebrew: hebrewContent.join("\n"),
        english: englishContent.join("\n")
      };
    });
  };

  const sections = splitContent();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <FileText className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">הנחיות אבטחה</h2>
      </div>
      
      <Tabs defaultValue="hebrew" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hebrew">עברית</TabsTrigger>
          <TabsTrigger value="english">English</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hebrew" className="mt-6 space-y-8">
          {sections.map((section, index) => (
            <div key={`he-${index}`} className="space-y-4">
              <h3 className="text-xl font-semibold">{section.title}</h3>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(section.hebrew) }} />
              {index < sections.length - 1 && <Separator className="my-6" />}
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="english" className="mt-6 space-y-8">
          {sections.map((section, index) => (
            <div key={`en-${index}`} className="space-y-4">
              <h3 className="text-xl font-semibold">{section.title}</h3>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(section.english) }} />
              {index < sections.length - 1 && <Separator className="my-6" />}
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Simple markdown renderer (for production, you'd want to use a proper markdown library)
const renderMarkdown = (markdown: string) => {
  let html = markdown
    // Code blocks
    .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Wrap in paragraph if not already
  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`;
  }
  
  // Fix lists
  html = html.replace(/<li>/g, '<ul><li>').replace(/<\/li><li>/g, '</li><li>').replace(/<\/li><\/p>/g, '</li></ul></p>');
  
  return html;
};
