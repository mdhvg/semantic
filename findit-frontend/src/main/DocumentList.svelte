<script lang="ts">
    import Document from "./Document.svelte";
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
    ];
</script>

<div
    class="document-list ml-auto w-2/3 md:w-5/6 grid grid-cols-4 gap-3 p-3 overflow-visible"
>
    {#each docs as document}
        <Document {document} />
    {/each}
</div>
