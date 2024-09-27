<script lang="ts">
  import { Trash2, Plus } from 'lucide-svelte'
  import DocumentList from './main/DocumentList.svelte'
  import Navbar from './navbar/Navbar.svelte'
  import { Button } from '$lib/components/ui/button'
  import { Label } from '$lib/components/ui/label'
  import { Separator } from '$lib/components/ui/separator'
  import { onMount } from 'svelte'
  import { ModeWatcher } from 'mode-watcher'
  import * as Resizable from '$lib/components/ui/resizable'

  import { baseUrl, commands, endpoints } from './endpoints'
  import {
    type DocumentRecordMap,
    type DocumentLoadStatus,
    type RenderListType,
    type DocumentFetchType
  } from './MyTypes'
  import { emptyDocumentRecord } from './MyTypes'
  import { nanoid } from 'nanoid'
  import MyEditor from './Editor/MyEditor.svelte'
  import type { DocumentMap, DocumentStatus } from '$shared/types'

  let currentDocuments: DocumentMap = {}
  let documentContent: DocumentStatus = {}
  let activeDocumentId: string
  let documentRenderList: RenderListType[] = []
  let deletedDocumentList: RenderListType[] = []

  function newDocument(): void {
    const id = nanoid()
    documentContent[id] = { loaded: true, content: '' }
    currentDocuments[id] = emptyDocumentRecord(id)
    activeDocumentId = id
  }

  $: console.log(currentDocuments)

  $: {
    documentRenderList = Object.keys(currentDocuments).map((i) => {
      return { id: i, title: currentDocuments[i].title }
    })
  }

  //$: {
  //  deletedDocumentList = Object.keys(currentDocuments).map((i) => {
  //    return { id: i, title: currentDocuments[i].title }
  //  })
  //}

  onMount(async () => {
    console.log(await window.api.serverStatus())
    window.api.fetchDocuments().then((data) => {
      console.log(data)
      for (const document of data) {
        currentDocuments[document.id] = document
        documentContent[document.id] = { loaded: false }
      }
    })
    // fetchDocuments()
    //window.electron.ipcRenderer.send('embedding-server', { command: 'start' })
    //window.electron.ipcRenderer.on('status', (event, arg) => {
    //console.log(event, arg)
    // console.log(window.electron.ipcRenderer.sendSync('db'))
  })
</script>

<!-- <svelte:window on:keydown={(e) => console.log(e)} /> -->
<ModeWatcher />
<main class="h-full w-full flex flex-col">
  <Separator />
  <Resizable.PaneGroup direction="horizontal">
    <Resizable.Pane defaultSize={15} minSize={10} maxSize={40} class="flex flex-col">
      <div class="px-2 flex flex-row items-center">
        <Label>All Documents</Label><Button
          variant="ghost"
          class="ml-auto px-1"
          on:click={newDocument}><Plus />New</Button
        >
      </div>
      <div class="render-list flex flex-col py-2 h-full w-full overflow-y-auto scrollbar-hide">
        {#each documentRenderList as doc}
          <div class="flex flex-row items-center">
            <Button
              variant="link"
              size="default"
              class="w-full h-8 {activeDocumentId === doc['id']
                ? 'text-foreground'
                : 'text-muted-foreground'}
              "
              on:click={() => {
                activeDocumentId = doc['id']
              }}
            >
              {doc['title']}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              on:click={() => {
                window.api.deleteDocument(doc['id'])
                let oldDoc = currentDocuments
                delete oldDoc[doc['id']]
                currentDocuments = oldDoc
              }}><Trash2 size={18} /></Button
            >
          </div>
          <Separator />
        {/each}
      </div>
    </Resizable.Pane>
    <Resizable.Handle class="z-1" />
    <Resizable.Pane defaultSize={85}>
      {#if !activeDocumentId}
        <DocumentList />
      {:else}
        <MyEditor bind:currentDocuments bind:documentContent bind:activeDocumentId />
        <!-- <TipTap bind:currentDocuments bind:documentLoaded bind:activeDocumentId /> -->
      {/if}
    </Resizable.Pane>
    <!-- <Resizable.Handle class="z-0" />
  <Resizable.Pane
    defaultSize={15}
    minSize={10}
    maxSize={35}
    class="flex flex-col"
  >
    <Label class="w-full p-2">Bin</Label>
    <div
      class="render-list flex flex-col py-2 h-full w-full overflow-y-auto scrollbar-hide"
    >
      {#each deletedDocumentList as doc}
        <div class="flex flex-row items-center">
          <Button
            variant="link"
            size="default"
            class="w-full h-8 {activeDocumentId === doc['id']
              ? 'text-foreground'
              : 'text-muted-foreground'}"
            on:click={() => {
              activeDocumentId = doc["id"];
            }}
          >
            {doc["title"]}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            on:click={() => {
              moveDocumentToBin(doc["id"]);
            }}><Trash2 size={18} /></Button
          >
        </div>
        <Separator />
      {/each}
    </div></Resizable.Pane
  > -->
  </Resizable.PaneGroup>
  <Separator />
  <div class="status-bar px-5"><Label class="text-muted-foreground">Status</Label></div>
</main>
<!-- Keeping the Navbar below main content keeps the content of search results over main content -->
<Navbar bind:activeDocumentId />
