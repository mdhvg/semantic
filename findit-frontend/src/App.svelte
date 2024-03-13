<script lang="ts">
  import TipTap from "./Editor/TipTap.svelte";
  import { Plus } from "lucide-svelte";
  import Sidebar from "./Sidebar/Sidebar.svelte";
  import DocumentList from "./main/DocumentList.svelte";
  import Navbar from "./navbar/Navbar.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { onMount } from "svelte";
  import { ModeWatcher } from "mode-watcher";
  import * as Resizable from "$lib/components/ui/resizable";

  let searchText: string;
  let selectedDocument: string = "";
  $: tipTapContent = "";
  $: {
    if (selectedDocument) {
      tipTapContent = docMetadatas[selectedDocument].content;
    }
  }
  let saveButton: Button | null = null;
  $: saveButton;
  async function search(): Promise<void> {
    if (!searchText) return;
    const response = await fetch(`/api/search?q=${searchText}`, {
      method: "GET",
    });
    const data = await response.json();
    console.log(data);
  }
  let docMetadatas: any = {};
  $: docMetadatas;
  onMount(async () => {
    const response = await fetch(
      "http://localhost:8080/api/documents/metadatas",
      {
        method: "GET",
      },
    );
    const data = await response.json();
    console.log(data);
    for (let i = 0; i < data.ids.length; i++) {
      docMetadatas[data.ids[i]] = data.metadatas[i];
    }
    for (let i of Object.keys(docMetadatas)) {
      console.log(i);
    }
    console.log(docMetadatas);
  });
</script>

<!-- <svelte:window on:keydown={(e) => console.log(e)} /> -->
<ModeWatcher />
<Navbar />
<Resizable.PaneGroup direction="horizontal" class="h-full w-16">
  <Resizable.Pane defaultSize={15}>
    <Sidebar renderList={docMetadatas} bind:selected={selectedDocument}>
      <svelte:fragment slot="title">
        <Label>All Documents</Label>
        <Button variant="ghost" class="ml-auto px-1"><Plus />New</Button>
      </svelte:fragment>
    </Sidebar>
  </Resizable.Pane>
  <Resizable.Handle />
  <Resizable.Pane defaultSize={50}>
    {#if !selectedDocument.length}
      <DocumentList />
    {:else}
      <TipTap bind:content={tipTapContent} bind:save={saveButton} />
    {/if}
  </Resizable.Pane>
  <Resizable.Handle />
  <Resizable.Pane defaultSize={15}>
    <Sidebar>
      <svelte:fragment slot="title">
        <Label>Tags</Label>
      </svelte:fragment>
      <DocumentList />
    </Sidebar>
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
