import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import MainLayout from "@/components/layout/main-layout"

export default function CreatePollPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create New Poll</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Poll Details</CardTitle>
              <CardDescription>
                Fill in the details to create your new poll
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Poll Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter your poll question" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Add more context about your poll"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="option1">Option 1</Label>
                  <Input 
                    id="option1" 
                    placeholder="First choice" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="option2">Option 2</Label>
                  <Input 
                    id="option2" 
                    placeholder="Second choice" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="option3">Option 3 (Optional)</Label>
                  <Input 
                    id="option3" 
                    placeholder="Third choice" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="option4">Option 4 (Optional)</Label>
                  <Input 
                    id="option4" 
                    placeholder="Fourth choice" 
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Create Poll
                  </Button>
                  <Button type="button" variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
