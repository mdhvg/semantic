<script lang="ts">
  import TipTap from "./Editor/TipTap.svelte";
  import { Plus } from "lucide-svelte";
  import Sidebar from "./Sidebar/Sidebar.svelte";
  import DocumentList from "./main/DocumentList.svelte";
  import Navbar from "./navbar/Navbar.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { onMount } from "svelte";

  let searchText: string;
  let documentText: string;
  $: openedDocument = "";
  function setOpenedDocument(title: string) {
    openedDocument = title;
  }
  $: console.log(openedDocument);
  async function search(): Promise<void> {
    if (!searchText) return;
    const response = await fetch(`/api/search?q=${searchText}`, {
      method: "GET",
    });
    const data = await response.json();
    console.log(data);
  }
  async function addDocument(): Promise<void> {
    const response = await fetch("/api/new-document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: documentText }),
    });
    const data = await response.json();
    console.log(data);
  }
  $: docMetadatas = [];
  onMount(async () => {
    const response = await fetch(
      "http://localhost:8080/api/documents/metadatas",
      {
        method: "GET",
      },
    );
    const data = await response.json();
    console.log(data);
    docMetadatas = data.metadatas.map(
      (metadata: any, index: string | number) => ({
        ...metadata,
        id: data.ids[index],
      }),
    );
    console.log(docMetadatas);
  });
</script>

<Navbar />
<Sidebar renderList={docMetadatas} {setOpenedDocument}>
  <svelte:fragment slot="title">
    <Label>All Documents</Label>
    <Button variant="ghost" size="icon" class="ml-auto"><Plus />New</Button>
  </svelte:fragment>
</Sidebar>
{#if !openedDocument.length}
  <DocumentList />
{:else}
  <TipTap documentId={openedDocument} />
{/if}
<Sidebar>
  <svelte:fragment slot="title">
    <Label>Tags</Label>
  </svelte:fragment>
  <DocumentList />
</Sidebar>
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
