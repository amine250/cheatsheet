"use client"

import { useState, useEffect } from "react"
import Fuse from "fuse.js"
import { Search, Copy, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"

const CHEAT_SHEET_URL = "https://raw.githubusercontent.com/amine250/cheatsheet/refs/heads/main/cheat-sheet-data.json"

type CheatSheetItem = {
  title: string
  content: string
}

type CheatSheetCategory = {
  category: string
  items: CheatSheetItem[]
}

const fuseOptions = {
  keys: ["category", "items.title", "items.content"],
  threshold: 0.4,
}

export default function ITCheatSheet() {
  const [cheatSheetData, setCheatSheetData] = useState<CheatSheetCategory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<CheatSheetCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const fetchCheatSheetData = async () => {
      try {
        const response = await fetch(CHEAT_SHEET_URL)
        if (!response.ok) {
          throw new Error("Failed to fetch cheat sheet data")
        }
        const data = await response.json()
        setCheatSheetData(data)
        setSearchResults(data)
      } catch (err) {
        setError("Error loading cheat sheet data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCheatSheetData()
  }, [])

  useEffect(() => {
    if (cheatSheetData.length > 0) {
      const fuse = new Fuse(cheatSheetData, fuseOptions)
      
      if (searchQuery === "") {
        setSearchResults(cheatSheetData)
      } else {
        const results = fuse.search(searchQuery).map((result) => result.item)
        setSearchResults(results)
      }
    }
  }, [searchQuery, cheatSheetData])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleCopy = (content: string, itemId: string) => {
    navigator.clipboard.writeText(content)
    setCopiedStates({ ...copiedStates, [itemId]: true })
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [itemId]: false })
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-6 text-primary text-center">Amine&apos;s Cheat Sheet</h1>
        <Skeleton className="w-full h-10 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-40" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const leftColumnCategories = searchResults.filter((_, index) => index % 2 === 0)
  const rightColumnCategories = searchResults.filter((_, index) => index % 2 !== 0)

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-6 text-primary text-center"
      >
        Amine&apos;s Cheat Sheet
      </motion.h1>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative mb-6"
      >
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search commands, scripts, etc..."
          value={searchQuery}
          onChange={handleSearch}
          className="pl-8 bg-background border-primary/20 focus:border-primary transition-all duration-300"
        />
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <AnimatePresence>
            {leftColumnCategories.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Accordion type="single" collapsible className="mb-4">
                  <AccordionItem value={`item-${index}`} className="border border-primary/20 rounded-lg">
                    <AccordionTrigger className="hover:bg-primary/5 px-4 py-2 rounded-t-lg transition-all duration-300">
                      {category.category}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2">
                      {category.items.map((item, itemIndex) => (
                        <Accordion key={itemIndex} type="single" collapsible className="mb-2">
                          <AccordionItem value={`subitem-${itemIndex}`} className="border border-primary/10 rounded-md">
                            <AccordionTrigger className="hover:bg-primary/5 px-3 py-1 rounded-t-md text-sm transition-all duration-300">
                              {item.title}
                            </AccordionTrigger>
                            <AccordionContent className="px-3 py-2">
                              <pre className="bg-muted p-2 rounded-md overflow-x-auto text-sm">
                                <code>{item.content}</code>
                              </pre>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                                onClick={() => handleCopy(item.content, `${category.category}-${item.title}`)}
                              >
                                {copiedStates[`${category.category}-${item.title}`] ? (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy to Clipboard
                                  </>
                                )}
                              </Button>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <AnimatePresence>
            {rightColumnCategories.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Accordion type="single" collapsible className="mb-4">
                  <AccordionItem value={`item-${index}`} className="border border-primary/20 rounded-lg">
                    <AccordionTrigger className="hover:bg-primary/5 px-4 py-2 rounded-t-lg transition-all duration-300">
                      {category.category}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2">
                      {category.items.map((item, itemIndex) => (
                        <Accordion key={itemIndex} type="single" collapsible className="mb-2">
                          <AccordionItem value={`subitem-${itemIndex}`} className="border border-primary/10 rounded-md">
                            <AccordionTrigger className="hover:bg-primary/5 px-3 py-1 rounded-t-md text-sm transition-all duration-300">
                              {item.title}
                            </AccordionTrigger>
                            <AccordionContent className="px-3 py-2">
                              <pre className="bg-muted p-2 rounded-md overflow-x-auto text-sm">
                                <code>{item.content}</code>
                              </pre>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                                onClick={() => handleCopy(item.content, `${category.category}-${item.title}`)}
                              >
                                {copiedStates[`${category.category}-${item.title}`] ? (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy to Clipboard
                                  </>
                                )}
                              </Button>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  )
}