<script lang="ts">
  import { baseUrl, endpoints } from '../endpoints'
  import SearchIcon from '../assets/SearchIcon.svelte'
  import type { SearchResultsType, SearchRenderListType } from '../MyTypes'
  import Separator from '$lib/components/ui/separator/separator.svelte'
  import Button from '$lib/components/ui/button/button.svelte'
  import { cn } from '$lib/utils'
  import type { SearchDocument } from '$shared/types'
  import { onMount } from 'svelte'

  let searchQuery: string = ''
  let searchTimeout: ReturnType<typeof setTimeout> | null = null
  let searchResult: SearchDocument
  export let activeDocumentId: string

  $: {
    console.log(searchResult)
  }

  function debounceSearch(): void {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async (): Promise<void> => {
      if (searchQuery.length > 0) {
        window.api.searchDocument(searchQuery)
      }
    }, 1000)
  }

  onMount(() => {
    window.api.onSearchResult((results: SearchDocument) => {
      if (!searchResult || results.timestamp > searchResult.timestamp) {
        searchResult = results
      }
    })
  })
</script>

<div
  class={cn(
    'search-wrapper flex flex-col gap-1 w-1/2 border border-border text-current rounded-lg group/search',
    $$props.class
  )}
>
  <div class="w-full h-full flex flex-row items-center px-3 gap-1">
    <input
      type="text"
      name="search"
      id="search"
      class="h-full w-full rounded-lg px-2 bg-inherit hover:outline-none focus-visible:outline-none"
      bind:value={searchQuery}
      on:input={debounceSearch}
    />
    <SearchIcon class="group-hover/search:fill-current h-2/3 fill-muted-foreground p-1" />
  </div>
  {#if searchResult && searchResult.documents.length !== 0}
    <div
      class="flex flex-col rounded-lg backdrop-blur-lg border border-border max-h-56 min-h-fit invisible group-focus-within/search:visible shadow-md shadow-border"
    >
      {#each searchResult.documents as result, index}
        <Button
          variant="ghost"
          class="rounded-none
                    {index === 0 ? 'rounded-t-lg' : ''}
                    {index === searchResult.documents.length - 1 ? 'rounded-b-lg' : ''}
                        "
          on:click={() => {
            activeDocumentId = result.document.id
          }}
        >
          {result.document.title}
        </Button>
        {#if index !== searchResult.documents.length - 1}
          <Separator />
        {/if}
      {/each}
    </div>
  {/if}
</div>
