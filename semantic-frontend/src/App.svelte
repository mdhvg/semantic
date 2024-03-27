<script lang="ts">
  import TipTap from "./Editor/TipTap.svelte";
  import { Trash, Trash2, Plus } from "lucide-svelte";
  import DocumentList from "./main/DocumentList.svelte";
  import Navbar from "./navbar/Navbar.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { Separator } from "$lib/components/ui/separator";
  import { onMount } from "svelte";
  import { ModeWatcher } from "mode-watcher";
  import * as Resizable from "$lib/components/ui/resizable";

  import { baseUrl, endpoints } from "./endpoints";
  import type {
    DocumentRecordMap,
    DocumentLoadStatus,
    RenderListType,
    DocumentFetchType,
  } from "./MyTypes";
  import { nanoid } from "nanoid";

  let currentDocuments: DocumentRecordMap = {};
  let documentLoaded: DocumentLoadStatus = {};
  let activeDocumentId: string;
  let documentRenderList: RenderListType[] = [];
  let deletedDocumentList: RenderListType[] = [];

  $: console.log(currentDocuments);

  function newDocument() {
    const id = nanoid();
    currentDocuments[id] = {
      title: "",
      content: "",
    };
    documentLoaded[id] = true;
    activeDocumentId = id;
  }

  $: {
    documentRenderList = Object.keys(currentDocuments)
      .filter((i) => !currentDocuments[i].deleted_status)
      .map((i) => {
        return { id: i, title: currentDocuments[i].title };
      });
  }

  $: {
    deletedDocumentList = Object.keys(currentDocuments)
      .filter((i) => currentDocuments[i].deleted_status)
      .map((i) => {
        return { id: i, title: currentDocuments[i].title };
      });
  }

  async function moveDocumentToBin(id: string) {
    try {
      const response = await fetch(
        baseUrl + endpoints.deleteDocument + "/" + id,
        {
          method: "DELETE",
          headers: {
            cors: "no-cors",
          },
        },
      );
      if (response.ok) {
        const updatedDocuments = currentDocuments;
        delete updatedDocuments[id];
        currentDocuments = updatedDocuments;
        const updatedDocumentLoaded = documentLoaded;
        delete updatedDocumentLoaded[id];
        documentLoaded = updatedDocumentLoaded;
        if (activeDocumentId == id) {
          activeDocumentId = "";
        }
      } else if (!response.ok && response.status === 503) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        moveDocumentToBin(id);
      } else {
        throw new Error(`Server is down with status ${response.status}`);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  }

  async function fetchDocuments() {
    try {
      const response = await fetch(
        baseUrl + endpoints.getByField + "/metadatas",
        {
          method: "GET",
          headers: {
            cors: "no-cors",
          },
        },
      );
      if (response.ok) {
        const data: DocumentFetchType = await response.json();
        console.log(data);
        for (let i = 0; i < data.ids.length; i++) {
          currentDocuments[data.ids[i]] = data.metadatas[i];
          documentLoaded[data.ids[i]] = false;
        }
      } else if (!response.ok && response.status === 503) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        fetchDocuments();
      } else {
        throw new Error(`Server is down with status ${response.status}`);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  }

  onMount(fetchDocuments);
</script>

<!-- <svelte:window on:keydown={(e) => console.log(e)} /> -->
<ModeWatcher />
<Separator />
<Resizable.PaneGroup direction="horizontal" class="h-full w-full">
  <Resizable.Pane
    defaultSize={15}
    minSize={10}
    maxSize={40}
    class="flex flex-col"
  >
    <div class="px-2 flex flex-row items-center">
      <Label>All Documents</Label>
      <Button variant="ghost" class="ml-auto px-1" on:click={newDocument}
        ><Plus />New</Button
      >
    </div>
    <div
      class="render-list flex flex-col py-2 h-full w-full overflow-y-auto scrollbar-hide"
    >
      {#each documentRenderList as doc}
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
    </div>
  </Resizable.Pane>
  <Resizable.Handle class="z-1" />
  <Resizable.Pane defaultSize={85}>
    {#if !activeDocumentId}
      <DocumentList />
    {:else}
      <TipTap bind:currentDocuments bind:documentLoaded bind:activeDocumentId />
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
<!-- Keeping the Navbar below main content keeps the content of search results over main content -->
<Navbar />
