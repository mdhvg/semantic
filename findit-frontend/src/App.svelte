<script lang="ts">
  import DocumentList from "./main/DocumentList.svelte";
  import LeftSideBar from "./main/LeftSideBar.svelte";
  import Navbar from "./navbar/Navbar.svelte";

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
</script>

<Navbar />
<div class="h-full w-full">
  <LeftSideBar />
  <DocumentList />
</div>
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
