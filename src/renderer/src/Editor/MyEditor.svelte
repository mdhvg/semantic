<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import {
    Bold,
    Italic,
    Code2,
    Eraser,
    Strikethrough,
    Pilcrow,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    List,
    ListOrdered,
    CodeSquare,
    Quote,
    SeparatorHorizontal,
    Undo,
    Redo,
    Save
  } from 'lucide-svelte'

  import Button from '$lib/components/ui/button/button.svelte'

  import { baseUrl, endpoints } from '../endpoints'
  import { type DocumentRecordMap, type DocumentLoadStatus, type Mime, MimeTypes } from '../MyTypes'
  import Label from '$lib/components/ui/label/label.svelte'

  import { Check } from 'lucide-svelte'
  import { ChevronsUpDown } from 'lucide-svelte'
  import * as Command from '$lib/components/ui/command/'
  import * as Popover from '$lib/components/ui/popover/'
  import { cn } from '$lib/utils.js'
  import { tick } from 'svelte'

  import { unified } from 'unified'
  import remarkParse from 'remark-parse'
  import remarkGfm from 'remark-gfm'
  import remarkRehype from 'remark-rehype'
  import rehypeStringify from 'rehype-stringify'
  import Input from '$lib/components/ui/input/input.svelte'
  import type { DocumentContent, DocumentMap } from '$shared/types'

  let preview: boolean = true
  let readOnly: boolean = false
  let title = ''
  let content = ''
  let previewContent = ''
  let mimeType = 'text/markdown'
  let lastActiveDocumentId: string = ''
  let currentBracket: [number, number] = [0, 0]

  export let currentDocuments: DocumentMap
  export let documentContent: DocumentContent
  export let activeDocumentId: string

  $: if (activeDocumentId && !documentContent[activeDocumentId].loaded) {
    loadContent(activeDocumentId).then((value) => {
      documentContent[activeDocumentId] = { loaded: true, content: value }
      content = documentContent[activeDocumentId].content
    })
  }

  $: if (activeDocumentId !== lastActiveDocumentId) {
    console.log(activeDocumentId)
    console.log(currentDocuments)
    if (currentDocuments[activeDocumentId]) {
      content = documentContent[activeDocumentId].content
      title = currentDocuments[activeDocumentId].title
    }
    lastActiveDocumentId = activeDocumentId
  }

  function getCursorPosition(): number {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      return range.startOffset
    }
    return 0
  }

  async function loadContent(activeDocumentId: string): Promise<string> {
    const document = await window.api.getDocument(activeDocumentId)
    return document
  }

  function togglePreview(): void {
    preview = !preview
  }

  function markdownToHTML(content: string): string {
    return String(
      unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeStringify, { allowDangerousHtml: true })
        .processSync(content)
    )
  }

  $: {
    if (preview) {
      previewContent = markdownToHTML(content)
    }
  }

  let open = false
  let value = ''

  $: mimeType = MimeTypes.find((f) => f === value) ?? 'text/markdown'

  function closeAndFocusTrigger(triggerId: string): void {
    open = false
    tick().then(() => {
      document.getElementById(triggerId)?.focus()
    })
  }
</script>

<div class="relative flex flex-col h-full">
  <section
    class="flex items-center flex—wrap border border-b-gray-400 p-2 w-full overflow-auto scrollbar-hide gap-1"
  >
    <div class="h-full w-full flex flex-row gap-1">
      <Input
        placeholder="Title"
        bind:value={title}
        on:input={() => {
          currentDocuments[activeDocumentId].title = title
        }}
      />
    </div>
    <!-- <Button variant="ghost" size="icon">
      <Bold />
    </Button>
    <Button variant="ghost" size="icon">
      <Italic />
    </Button>
    <Button variant="ghost" size="icon">
      <Strikethrough />
    </Button>
    <Button variant="ghost" size="icon">
      <Code2 />
    </Button>
    <Button variant="ghost" size="icon">
      <Eraser />
    </Button>
    <Separator orientation="vertical" />
    <Button variant="ghost">
      <Pilcrow />
    </Button>
    <Button variant="ghost">
      <Heading1 />
    </Button>
    <Button variant="ghost">
      <Heading2 />
    </Button>
    <Button variant="ghost">
      <Heading3 />
    </Button>
    <Button variant="ghost">
      <Heading4 />
    </Button>
    <Button variant="ghost">
      <Heading5 />
    </Button>
    <Button variant="ghost">
      <Heading6 />
    </Button>
    <Separator orientation="vertical" />
    <Button variant="ghost">
      <List />
    </Button>
    <Button variant="ghost">
      <ListOrdered />
    </Button>
    <Button variant="ghost">
      <CodeSquare />
    </Button>
    <Button variant="ghost">
      <Quote />
    </Button>
    <Button variant="ghost" size="icon">
      <SeparatorHorizontal />
    </Button>
    <Separator orientation="vertical" />
    <Button variant="ghost" size="icon">
      <Undo />
    </Button>
    <Button variant="ghost" size="icon">
      <Redo />
    </Button> -->
    <div class="end-buttons ml-auto h-full flex flex-row gap-1">
      <div class="popover h-full w-full">
        <Popover.Root bind:open let:ids>
          <Popover.Trigger asChild let:builder>
            <Button
              builders={[builder]}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              class="w-[200px] justify-between"
            >
              text/markdown
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </Popover.Trigger>
          <Popover.Content class="w-[200px] p-0">
            <Command.Root>
              <Command.Input placeholder="Search mimetype" />
              <Command.Empty>No MimeTypes found.</Command.Empty>
              <Command.Group>
                {#each MimeTypes as mime}
                  <Command.Item
                    value={mime}
                    onSelect={(currentValue) => {
                      if (currentValue === 'text/markdown' || currentValue === 'text/plain') {
                        currentDocuments[activeDocumentId].meta.mime = currentValue
                      }
                      closeAndFocusTrigger(ids.trigger)
                    }}
                  >
                    <Check class={cn('mr-2 h-4 w-4', value !== mime && 'text-transparent')} />
                    {mime}
                  </Command.Item>
                {/each}
              </Command.Group>
            </Command.Root>
          </Popover.Content>
        </Popover.Root>
      </div>
      <Button class="w-full h-full" on:click={togglePreview}><Label>Toggle Preview</Label></Button>
      <Button
        variant="default"
        class="w-full h-full"
        on:click={() => {
          window.api.saveDocument(
            activeDocumentId,
            currentDocuments[activeDocumentId],
            documentContent[activeDocumentId].content
          )
        }}><Save /></Button
      >
    </div>
  </section>
  <div class="w-full h-full overflow-hidden flex flex-row">
    <textarea
      placeholder="Type something here..."
      contenteditable={readOnly}
      class="h-full rounded-none border border-input bg-transparent px-3 py-1 text-md shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 {preview
        ? 'w-1/2'
        : 'w-full'}"
      bind:value={content}
      on:input={() => {
        documentContent[activeDocumentId].content = content
      }}
    />
    {#if preview}
      <div class="h-full w-1/2 px-3 py-1 overflow-auto prose">
        {#if previewContent}
          {@html previewContent}
        {:else}
          <p class="text-muted-foreground">Nothing to preview</p>
        {/if}
      </div>
    {/if}
  </div>
</div>
