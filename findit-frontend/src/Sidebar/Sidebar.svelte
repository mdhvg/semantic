<script lang="ts">
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    export let renderList: string[] = [];
</script>

<div class="w-1/6 mt-16 px-2 flex flex-col">
    <div class="flex flex-row items-center">
        <slot name="title" />
    </div>
    <div
        class="render-list flex flex-col py-2 h-full w-full overflow-y-auto appearance-none"
    >
        {#each renderList as doc}
            <Label>{doc}</Label>
            <Separator class="my-2" />
        {/each}
    </div>
</div>
