
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import VoiceMemo from '@/components/VoiceMemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MicIcon, 
  ArchiveIcon, 
  BookmarkIcon, 
  PlusIcon,
  PaletteIcon
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Category color options
const categoryColors = [
  { name: "Default", value: "default" },
  { name: "Purple", value: "purple" },
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Yellow", value: "yellow" },
  { name: "Orange", value: "orange" },
  { name: "Red", value: "red" },
  { name: "Pink", value: "pink" }
];

const VoiceMemoPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('default');
  
  // Load custom categories from localStorage on component mount
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem('voiceMemoCustomCategories');
      if (savedCategories) {
        setCustomCategories(JSON.parse(savedCategories));
      }
      
      const savedColors = localStorage.getItem('voiceMemoCustomCategoryColors');
      if (savedColors) {
        setCategoryColors(JSON.parse(savedColors));
      }
    } catch (error) {
      console.error("Error loading custom categories:", error);
    }
  }, []);
  
  // Save custom categories to localStorage
  const saveCustomCategories = (categories: string[], colors: Record<string, string>) => {
    try {
      localStorage.setItem('voiceMemoCustomCategories', JSON.stringify(categories));
      localStorage.setItem('voiceMemoCustomCategoryColors', JSON.stringify(colors));
    } catch (error) {
      console.error("Error saving custom categories:", error);
    }
  };
  
  // Add new custom category
  const addCustomCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Category name required",
        description: "Please enter a name for your category",
        variant: "destructive"
      });
      return;
    }
    
    const formattedName = newCategoryName.trim();
    
    if (customCategories.includes(formattedName)) {
      toast({
        title: "Category already exists",
        description: "Please use a different name",
        variant: "destructive"
      });
      return;
    }
    
    const updatedCategories = [...customCategories, formattedName];
    const updatedColors = {...categoryColors, [formattedName]: newCategoryColor};
    
    setCustomCategories(updatedCategories);
    setCategoryColors(updatedColors);
    saveCustomCategories(updatedCategories, updatedColors);
    setNewCategoryName('');
    setNewCategoryColor('default');
    setIsAddCategoryOpen(false);
    
    toast({
      title: "Category created",
      description: `New category "${formattedName}" has been created`
    });
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-medium">Voice Memos</h1>
          <p className="text-muted-foreground">
            Record and save your voice notes
          </p>
        </div>

        {/* Voice Memo Tabs */}
        <Card className="neo-morphism border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MicIcon className="h-5 w-5 mr-2 text-primary" />
              Voice Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="all">All Recordings</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-0">
                <VoiceMemo 
                  filterType="all" 
                  customCategories={customCategories}
                  categoryColors={categoryColors}
                  onCreateCategory={() => setIsAddCategoryOpen(true)}
                />
              </TabsContent>
              <TabsContent value="favorites" className="mt-0">
                <VoiceMemo 
                  filterType="favorites" 
                  customCategories={customCategories}
                  categoryColors={categoryColors}
                  onCreateCategory={() => setIsAddCategoryOpen(true)}
                />
              </TabsContent>
              <TabsContent value="archived" className="mt-0">
                <VoiceMemo 
                  filterType="archived" 
                  customCategories={customCategories}
                  categoryColors={categoryColors}
                  onCreateCategory={() => setIsAddCategoryOpen(true)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Add Category Dialog */}
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Custom Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomCategory();
                    }
                  }}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="categoryColor">Category Color</Label>
                <RadioGroup
                  value={newCategoryColor}
                  onValueChange={setNewCategoryColor}
                  className="flex flex-wrap gap-2"
                >
                  {categoryColors.map((color) => (
                    <div key={color.value} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={color.value} 
                        id={`color-${color.value}`}
                        className="peer sr-only" 
                      />
                      <Label
                        htmlFor={`color-${color.value}`}
                        className="flex items-center justify-center rounded-full p-1 w-8 h-8 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary cursor-pointer"
                        style={{
                          backgroundColor: 
                            color.value === 'default' ? 'var(--primary)' :
                            color.value === 'purple' ? '#9b87f5' :
                            color.value === 'blue' ? '#0EA5E9' :
                            color.value === 'green' ? '#10B981' :
                            color.value === 'yellow' ? '#F59E0B' :
                            color.value === 'orange' ? '#F97316' :
                            color.value === 'red' ? '#EF4444' :
                            color.value === 'pink' ? '#EC4899' : 'var(--primary)',
                          opacity: 0.8
                        }}
                      >
                        <span className="sr-only">{color.name}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddCategoryOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={addCustomCategory}>
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default VoiceMemoPage;
