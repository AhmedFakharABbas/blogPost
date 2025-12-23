import { useState } from "react"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"

import { ContentEditable } from "@/src/components/editor/editor-ui/content-editable"

export function Plugins() {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null)

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div className="relative">
      <RichTextPlugin
        contentEditable={
          <div className="relative" ref={onRef}>
            <ContentEditable placeholder={"Start typing ..."} />
          </div>
        }
        placeholder={
          <div className="text-muted-foreground pointer-events-none absolute top-4 left-8 select-none">
            Start typing ...
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
    </div>
  )
}
