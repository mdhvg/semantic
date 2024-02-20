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

<section
    class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3 p-3 overflow-visible"
>
    {#each docs as document}
        <Document {document} />
    {/each}
</section>
