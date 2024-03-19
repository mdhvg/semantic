<script lang="ts">
  import TipTap from "./Editor/TipTap.svelte";
  import { Trash2, Plus } from "lucide-svelte";
  import Sidebar from "./Sidebar/Sidebar.svelte";
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
  } from "./myTypes";
  import { nanoid } from "nanoid";

  let currentDocuments: DocumentRecordMap = {};
  let documentLoaded: DocumentLoadStatus = {};
  let activeDocumentId: string;
  let renderList: RenderListType[] = [];

  function newDocument() {
    const id = nanoid();
    currentDocuments[id] = {
      title: "",
      content: "1",
    };
    documentLoaded[id] = true;
    activeDocumentId = id;
  }

  $: {
    renderList = Object.keys(currentDocuments).map((i) => {
      return { id: i, title: currentDocuments[i].title };
    });
  }

  onMount(async () => {
    const response = await fetch(
      baseUrl + endpoints.getByField + "/metadatas",
      {
        method: "GET",
      },
    );
    const data = await response.json();
    for (let i = 0; i < data.ids.length; i++) {
      currentDocuments[data.ids[i]] = data.metadatas[i];
      documentLoaded[data.ids[i]] = false;
    }
  });
</script>

<!-- <svelte:window on:keydown={(e) => console.log(e)} /> -->
<ModeWatcher />
<Navbar />
<Resizable.PaneGroup direction="horizontal" class="h-full w-16">
  <Resizable.Pane defaultSize={15} minSize={10} maxSize={35}>
    <Sidebar>
      <svelte:fragment slot="title">
        <Label>All Documents</Label>
        <Button variant="ghost" class="ml-auto px-1" on:click={newDocument}
          ><Plus />New</Button
        >
      </svelte:fragment>
      <div
        class="render-list flex flex-col py-2 h-full w-full overflow-y-auto appearance-none"
        slot="iterable"
      >
        {#each renderList as doc}
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
            <Button size="sm" variant="ghost"><Trash2 size={18} /></Button>
          </div>
          <Separator class="mb-1" />
        {/each}
      </div>
    </Sidebar>
  </Resizable.Pane>
  <Resizable.Handle />
  <Resizable.Pane defaultSize={70} minSize={50}>
    {#if !activeDocumentId}
      <DocumentList />
    {:else}
      <TipTap bind:currentDocuments bind:documentLoaded bind:activeDocumentId />
    {/if}
  </Resizable.Pane>
  <Resizable.Handle />
  <Resizable.Pane defaultSize={15} minSize={10} maxSize={35}>
    <!-- <Sidebar>
      <svelte:fragment slot="title">
        <Label>Tags</Label>
      </svelte:fragment>
      <DocumentList />
    </Sidebar> -->
  </Resizable.Pane>
</Resizable.PaneGroup>
<!-- </div>? -->

<!-- <form on:submit|preventDefault={search} class="flex-1">
  <input
    type="search"
    id="search"
    name="search"
    placeholder="Search..."
    bind:value={searchText}
    required
  />
  <button type="submit">Search</button>
</form>
<form on:submit|preventDefault={addDocument} class="flex-1">
  <input
    type="text"
    id="add-document"
    name="add-document"
    placeholder="Add note..."
    bind:value={documentText}
  />
  <button type="submit">Add</button>
</form> -->
