<script lang="ts">
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    export let selected: string;
    export let renderList: any;
    export let returnComponent: string = "id";
    export let titleComponent: string = "title";
</script>

<!-- <div class="w-1/6 mt-16 px-2 flex flex-col"> -->
<div class="w-full px-2 flex flex-col">
    <div class="flex flex-row items-center">
        <slot name="title" />
    </div>
    <div
        class="render-list flex flex-col py-2 h-full w-full overflow-y-auto appearance-none"
    >
        {#each renderList as doc}
            <Button
                variant="ghost"
                size="default"
                class="w-full h-8"
                on:click={() => {
                    selected = doc[returnComponent];
                }}
            >
                {doc[titleComponent]}
            </Button>
            <Separator class="mb-1" />
        {/each}
    </div>
</div>
