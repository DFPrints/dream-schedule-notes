
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import VoiceMemo from '@/components/VoiceMemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MicIcon, 
  ArchiveIcon, 
  BookmarkIcon, 
  PlusIcon 
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

const VoiceMemoPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Load custom categories from localStorage on component mount
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem('voiceMemoCustomCategories');
      if (savedCategories) {
        setCustomCategories(JSON.parse(savedCategories));
      }
    } catch (error) {
      console.error("Error loading custom categories:", error);
    }
  }, []);
  
  // Save custom categories to localStorage
  const saveCustomCategories = (categories: string[]) => {
    try {
      localStorage.setItem('voiceMemoCustomCategories', JSON.stringify(categories));
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
    setCustomCategories(updatedCategories);
    saveCustomCategories(updatedCategories);
    setNewCategoryName('');
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
                  onCreateCategory={() => setIsAddCategoryOpen(true)}
                />
              </TabsContent>
              <TabsContent value="favorites" className="mt-0">
                <VoiceMemo 
                  filterType="favorites" 
                  customCategories={customCategories}
                  onCreateCategory={() => setIsAddCategoryOpen(true)}
                />
              </TabsContent>
              <TabsContent value="archived" className="mt-0">
                <VoiceMemo 
                  filterType="archived" 
                  customCategories={customCategories}
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
