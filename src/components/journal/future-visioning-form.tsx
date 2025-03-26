"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FutureVisioningForm() {
  const [activeTab, setActiveTab] = useState("career")
  const [lifeArea, setLifeArea] = useState("career")

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="title">Title</Label>
        <Textarea
          id="title"
          name="title"
          placeholder="Give your future vision entry a title"
          className="min-h-[50px]"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="content">Journal Entry</Label>
        <Textarea
          id="content"
          name="content"
          placeholder="Write your journal entry here..."
          className="min-h-[200px]"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="timeframe">Timeframe</Label>
        <Select name="timeframe" defaultValue="5-years">
          <SelectTrigger id="timeframe">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-year">1 Year</SelectItem>
            <SelectItem value="3-years">3 Years</SelectItem>
            <SelectItem value="5-years">5 Years</SelectItem>
            <SelectItem value="10-years">10 Years</SelectItem>
            <SelectItem value="lifetime">Lifetime</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="lifeArea">Life Area</Label>
        <Select 
          name="lifeArea" 
          value={lifeArea} 
          onValueChange={(value) => {
            setLifeArea(value)
            setActiveTab(value)
          }}
        >
          <SelectTrigger id="lifeArea">
            <SelectValue placeholder="Select life area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="career">Career</SelectItem>
            <SelectItem value="personal">Personal Growth</SelectItem>
            <SelectItem value="lifestyle">Lifestyle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="career">Career</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
        </TabsList>

        <TabsContent value="career" className="mt-4 space-y-4">
          <div className="space-y-3">
            <Label htmlFor="career-vision">Career Vision</Label>
            <Textarea
              id="career-vision"
              name="visionDescription"
              placeholder="What does your ideal career look like? What role do you have? What impact are you making?"
              className="min-h-[150px]"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="career-skills">Skills & Knowledge</Label>
            <Textarea
              id="career-skills"
              name="actionSteps"
              placeholder="What skills or knowledge will you need to develop to achieve this vision?"
              className="min-h-[100px]"
            />
          </div>
        </TabsContent>

        <TabsContent value="personal" className="mt-4 space-y-4">
          <div className="space-y-3">
            <Label htmlFor="personal-growth">Personal Growth Vision</Label>
            <Textarea
              id="personal-growth"
              name="visionDescription"
              placeholder="How do you see yourself growing as a person? What personal qualities will you develop?"
              className="min-h-[150px]"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="personal-actions">Personal Growth Actions</Label>
            <Textarea
              id="personal-actions"
              name="actionSteps"
              placeholder="What specific actions will you take to achieve this personal growth?"
              className="min-h-[100px]"
            />
          </div>
        </TabsContent>

        <TabsContent value="lifestyle" className="mt-4 space-y-4">
          <div className="space-y-3">
            <Label htmlFor="lifestyle-vision">Lifestyle Vision</Label>
            <Textarea
              id="lifestyle-vision"
              name="visionDescription"
              placeholder="Where do you live? What is your home like? What is your daily routine?"
              className="min-h-[150px]"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="lifestyle-actions">Lifestyle Actions</Label>
            <Textarea
              id="lifestyle-actions"
              name="actionSteps"
              placeholder="What specific actions will you take to achieve this lifestyle?"
              className="min-h-[100px]"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-3">
        <Label htmlFor="obstacles">Potential Obstacles</Label>
        <Textarea
          id="obstacles"
          name="obstacles"
          placeholder="What challenges might you face in achieving this vision? How might you overcome them?"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="support-needed">Support Needed</Label>
        <Textarea
          id="support-needed"
          name="supportNeeded"
          placeholder="What support or resources will you need to achieve this vision?"
          className="min-h-[100px]"
        />
      </div>
    </div>
  )
}

