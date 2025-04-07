import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MarketplaceTemplate } from "@/lib/firebase/types"
import { useState } from "react"
import { storage } from "@/lib/firebase/config"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

interface MarketplaceTemplateFormProps {
  template: MarketplaceTemplate;
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function MarketplaceTemplateForm({ template, onSubmit }: MarketplaceTemplateFormProps) {
  console.log('MarketplaceTemplateForm - Received template:', template);
  console.log('MarketplaceTemplateForm - Journal Types:', template.journalTypes);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const processedData = new FormData();

      // Process each form field
      for (const [key, value] of formData.entries()) {
        // Handle file uploads
        if (value instanceof File && value.size > 0) {
          try {
            const storageRef = ref(storage, `journal-entries/${value.name}-${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, value);
            const downloadURL = await getDownloadURL(snapshot.ref);
            processedData.append(key, downloadURL);
          } catch (error) {
            console.error('Error uploading file:', error);
            processedData.append(key, ''); // Add empty string if upload fails
          }
        } else {
          processedData.append(key, value);
        }
      }

      await onSubmit(processedData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create {template.name} Entry</CardTitle>
          <CardDescription>
            Fill out the form below to create a new entry for your {template.name.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={template.journalTypes[0].id} className="w-full">
            <TabsList className="w-full flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
              {template.journalTypes.map((journalType) => {
                console.log('Rendering tab for journal type:', journalType.name);
                return (
                  <TabsTrigger 
                    key={journalType.id} 
                    value={journalType.id}
                    className="flex-1 min-w-[120px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    {journalType.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {template.journalTypes.map((journalType) => {
              console.log('Rendering content for journal type:', journalType.name);
              console.log('Fields for this journal type:', journalType.fields);
              
              return (
                <TabsContent key={journalType.id} value={journalType.id} className="mt-6 focus-visible:outline-none">
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-medium">{journalType.name}</h3>
                      <p className="text-sm text-muted-foreground">{journalType.description}</p>
                    </div>

                    <div className="space-y-4">
                      {journalType.fields.map((field) => {
                        console.log('Rendering field:', field);
                        console.log('Field type:', field.type);
                        
                        return (
                          <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id}>
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            
                            {field.description && (
                              <p className="text-sm text-muted-foreground">{field.description}</p>
                            )}
                            
                            {field.type === 'text' && (
                              <Input
                                type="text"
                                id={field.id}
                                name={`metadata.${field.id}`}
                                className="w-full"
                                placeholder={field.placeholder}
                                required={field.required}
                              />
                            )}
                            
                            {field.type === 'number' && (
                              <Input
                                type="number"
                                id={field.id}
                                name={`metadata.${field.id}`}
                                className="w-full"
                                placeholder={field.placeholder}
                                required={field.required}
                              />
                            )}
                            
                            {field.type === 'textarea' && (
                              <Textarea
                                id={field.id}
                                name={`metadata.${field.id}`}
                                className="w-full min-h-[100px]"
                                placeholder={field.placeholder}
                                required={field.required}
                              />
                            )}
                            
                            {field.type === 'select' && field.options && (
                              <Select name={`metadata.${field.id}`} required={field.required}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={field.placeholder || "Select an option"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}

                            {field.type === 'multiselect' && field.options && (
                              <div className="space-y-2">
                                {field.options.map((option) => (
                                  <div key={option} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${field.id}-${option}`}
                                      name={`metadata.${field.id}`}
                                      value={option}
                                    />
                                    <Label htmlFor={`${field.id}-${option}`} className="text-sm font-normal">
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            )}

                            {field.type === 'image' && (
                              <Input
                                type="file"
                                id={field.id}
                                name={`metadata.${field.id}`}
                                className="w-full"
                                accept="image/*"
                                required={field.required}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Hidden inputs for form submission */}
                    <input type="hidden" name="content" value={`${template.name} - ${journalType.name}`} />
                    <input type="hidden" name="category" value={`marketplace-${template.id}`} />
                    <input type="hidden" name="type" value={journalType.id} />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Entry...' : 'Create Entry'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
} 