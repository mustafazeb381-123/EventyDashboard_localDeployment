// components/SideDrawer.tsx
import React from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

const SideBar= () => {
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline">☰ Open Menu</Button>
      </DrawerTrigger>
      <DrawerContent className="left-0 h-screen w-[300px] rounded-none border-r border-gray-200 shadow-lg">
        <DrawerHeader className="px-4 pt-4">
          <DrawerTitle className="text-lg font-bold">Sidebar Menu</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-3">
          <Button variant="ghost" className="w-full justify-start">Home</Button>
          <Button variant="ghost" className="w-full justify-start">Profile</Button>
          <Button variant="ghost" className="w-full justify-start">Settings</Button>
        </div>
        <div className="absolute bottom-4 left-4">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default SideBar
