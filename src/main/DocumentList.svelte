<script lang="ts">
    import { onMount } from "svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Document from "./Document.svelte";
    $: docData = [];
    // onMount(async () => {
    //     const response = await fetch(
    //         "http://localhost:8080/api/documents/metadatas",
    //         {
    //             method: "GET",
    //         },
    //     );
    //     const data = await response.json();
    //     let outData: any;
    //     for (let i = 0; i < data["ids"].length; i++) {
    //         outData.push({
    //             id: data["ids"][i],
    //             ...data["metadatas"][i],
    //         });
    //     }
    //     docData = outData;
    // });
</script>

<section
    class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-3 overflow-y-auto"
>
    {#each docData as document}
        <Document {document} />
    {/each}
</section>
