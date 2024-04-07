<!--
    TODO: Replace TipTap with ByteMD https://github.com/bytedance/bytemd
    or codemirror https://codemirror.net (Preferably)
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { Editor } from '@tiptap/core'
  import Typography from '@tiptap/extension-typography'
  import StarterKit from '@tiptap/starter-kit'
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
  import Separator from '$lib/components/ui/separator/separator.svelte'

  import { baseUrl, endpoints } from '../endpoints'
  import type { DocumentRecordMap, DocumentLoadStatus } from '../MyTypes'

  let element: HTMLElement
  let editor: Editor | null = null
  let content: string = ''
  let lastActiveDocumentId: string = ''

  export let currentDocuments: DocumentRecordMap
  export let documentLoaded: DocumentLoadStatus
  export let activeDocumentId: string

  $: if (activeDocumentId && !documentLoaded[activeDocumentId]) {
    console.log('2')
    loadContent(activeDocumentId).then((value) => {
      currentDocuments[activeDocumentId].content = value
      documentLoaded[activeDocumentId] = true
      editor?.commands.setContent(currentDocuments[activeDocumentId].content || '')
      currentDocuments[activeDocumentId].deleted_status && editor?.setEditable(false)
    })
  }

  $: if (activeDocumentId !== lastActiveDocumentId) {
    console.log('1')
    if (currentDocuments[activeDocumentId]) {
      editor?.commands.setContent(currentDocuments[activeDocumentId].content || '')
    }
    lastActiveDocumentId = activeDocumentId
  }

  async function loadContent(activeDocumentId: string): Promise<string> {
    const response = await fetch(`${baseUrl}${endpoints.getContent}/${activeDocumentId}`, {
      method: 'GET'
    })
    const data = await response.json()
    return data.documents[0]
  }

  onMount(async () => {
    console.log('mount')
    editor = new Editor({
      element: element,
      extensions: [StarterKit, Typography],
      content: content,
      onTransaction: () => {
        editor = editor
      },
      onUpdate: () => {
        currentDocuments[activeDocumentId].content = editor?.getHTML() || content
      },
      editorProps: {
        attributes: {
          class: 'prose focus:outline-none max-w-full text-wrap pointer-events-auto'
        }
      }
    })
  })

  onDestroy(() => {
    if (editor) {
      editor.destroy()
    }
  })

  async function sendPost() {
    if (editor) {
      let title: string = editor.getText().split('\n')[0]
      currentDocuments[activeDocumentId].title = title
      let response = await fetch(`${baseUrl}${endpoints.saveDocument}/${activeDocumentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentDocuments[activeDocumentId])
      })
      const data = await response.json()
      console.log('Save result:')
      console.log(data)
    }
  }
</script>

<div class="border border-gray-400 relative flex flex-col h-full">
  <section
    class="flex items-center flex—wrap border border-b-gray-400 p-2 w-full overflow-auto scrollbar-hide"
  >
    {#if editor !== null}
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        class={editor.isActive('bold') ? 'is-active' : ''}
      >
        <Bold />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        class={editor.isActive('italic') ? 'is-active' : ''}
      >
        <Italic />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        class={editor.isActive('strike') ? 'is-active' : ''}
      >
        <Strikethrough />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        class={editor.isActive('code') ? 'is-active' : ''}
      >
        <Code2 />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().unsetAllMarks().run()}
      >
        <Eraser />
      </Button>
      <Separator orientation="vertical" />
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().setParagraph().run()}
        class={editor.isActive('paragraph') ? 'is-active' : ''}
      >
        <Pilcrow />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        class={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
      >
        <Heading1 />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        class={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
      >
        <Heading2 />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        class={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
      >
        <Heading3 />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
        class={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
      >
        <Heading4 />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleHeading({ level: 5 }).run()}
        class={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
      >
        <Heading5 />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleHeading({ level: 6 }).run()}
        class={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
      >
        <Heading6 />
      </Button>
      <Separator orientation="vertical" />
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleBulletList().run()}
        class={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        <List />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleOrderedList().run()}
        class={editor.isActive('orderedList') ? 'is-active' : ''}
      >
        <ListOrdered />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleCodeBlock().run()}
        class={editor.isActive('codeBlock') ? 'is-active' : ''}
      >
        <CodeSquare />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().toggleBlockquote().run()}
        class={editor.isActive('blockquote') ? 'is-active' : ''}
      >
        <Quote />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().setHorizontalRule().run()}
      >
        <SeparatorHorizontal />
      </Button>
      <Separator orientation="vertical" />
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <Undo />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => editor?.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <Redo />
      </Button>
      <Button
        variant="default"
        class="ml-auto h-full"
        on:click={() => {
          sendPost()
        }}><Save /></Button
      >
    {/if}
  </section>
  <div
    bind:this={element}
    aria-hidden="true"
    on:click={() => editor?.chain().focus().run()}
    class="py-1 px-2 overflow-y-auto h-full w-full max-w-full appearance-none"
  ></div>
</div>
