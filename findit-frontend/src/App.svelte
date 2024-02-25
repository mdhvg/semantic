<script lang="ts">
  import TipTap from "./Editor/TipTap.svelte";
  import { Plus } from "lucide-svelte";
  import Sidebar from "./Sidebar/Sidebar.svelte";
  import DocumentList from "./main/DocumentList.svelte";
  import Navbar from "./navbar/Navbar.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";

  let searchText: string;
  let documentText: string;
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
  $: docs = [
    {
      id: 1,
      title: "Document 1",
      content: "Content of document 1",
    },
    {
      id: 2,
      title: "Document 2",
      content: "Content of document 2",
    },
    {
      id: 3,
      title: "Document 3",
      content: "Content of document 3",
    },
    {
      id: 3,
      title: "Document 3",
      content: "Content of document 3",
    },
    {
      id: 3,
      title: "Document 3",
      content: "Content of document 3",
    },
    {
      id: 3,
      title: "Document 3",
      content: "Content of document 3",
    },
    {
      id: 3,
      title: "Document 3",
      content: "Content of document 3",
    },
    {
      id: 3,
      title: "Document 3",
      content: "Content of document 3",
    },
    {
      id: 3,
      title: "Document 3",
      content: "Content of document 3",
    },
    {
      id: 3,
      title: "Document 3",
      content: "Content of document 3",
      starred: true,
    },
    {
      id: 3,
      title: "Document 3",
      content: "Content of document 3",
    },
    {
      id: 3,
      title: "Document 3",
      content: "Content of document 3",
    },
    {
      id: 3,
      title: "Document 3",
      content: "Content of document 3",
    },
    {
      id: 3,
      title: "Document 3",
      content: "Content of document 3",
    },
    {
      id: 3,
      title: "Document 3",
      content: "Content of document 3",
    },
  ];
</script>

<Navbar />
<!-- <div class="flex flex-row mt-16 w-full h-full overflow-hidden"> -->
<Sidebar renderList={docs.map((doc) => doc.title)}>
  <svelte:fragment slot="title">
    <Label>All Documents</Label>
    <Button variant="ghost" size="icon" class="ml-auto"><Plus />New</Button>
  </svelte:fragment>
</Sidebar>
<DocumentList />
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
