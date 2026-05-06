import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"
import { Copy, Send, Sparkles } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

// TODO: replace with your own API key
const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""

interface PromptInputBoxProps {
  children?: React.ReactNode
}

export function PromptInputBox({ children }: PromptInputBoxProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedText, setGeneratedText] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim() || !API_KEY) return
    setIsGenerating(true)
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 150,
          temperature: 0.7,
        }),
      })
      const data = await response.json()
      if (data.choices?.[0]?.message?.content) {
        setGeneratedText(data.choices[0].message.content)
      } else {
        setGeneratedText("Nessun contenuto generato")
      }
    } catch (error) {
      console.error("Errore di generazione:", error)
      setGeneratedText("Errore durante la generazione")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (generatedText) {
      await navigator.clipboard.writeText(generatedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children || <Button variant="outline">Genera Prompt</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Prompt Generator
          </DialogTitle>
          <DialogDescription>Inserisci il tuo prompt e genera contenuto intelligente</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt" className="text-foreground">
              Prompt
            </Label>
            <Input
              id="prompt"
              placeholder="Scrivi qui il tuo prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-muted text-foreground"
              disabled={isGenerating}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim() || !API_KEY} className="flex-1">
              {isGenerating ? "Generazione..." : (generatedText ? "Rigenera" : "Genera")}
            </Button>
            {generatedText && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleCopy} disabled={copied}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? "Copiato!" : "Copia"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <AnimatePresence mode="popLayout">
            {generatedText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="rounded-md border bg-secondary p-3 text-sm text-secondary-foreground"
              >
                <p className="font-medium">Risultato:</p>
                <p className="mt-1 whitespace-pre-wrap">{generatedText}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Demo standalone component for testing/preview
export function DemoOne() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <PromptInputBox>
        <Button size="lg">Apri Generatore</Button>
      </PromptInputBox>
    </div>
  )
}

// Export default for easy import
export default PromptInputBox