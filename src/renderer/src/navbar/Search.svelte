<script lang="ts">
  import { baseUrl, endpoints } from '../endpoints'
  import SearchIcon from '../assets/SearchIcon.svelte'
  import type { SearchResultsType, SearchRenderListType } from '../MyTypes'
  import Separator from '$lib/components/ui/separator/separator.svelte'
  import Button from '$lib/components/ui/button/button.svelte'
  import { cn } from '$lib/utils'

  let searchQuery: string = ''
  let searchTimeout: ReturnType<typeof setTimeout> | null = null
  let searchResult: SearchResultsType = {}
  let searchResultList: SearchRenderListType[] = []

  $: {
    console.log(searchResult)
  }

  $: {
    searchResultList = Object.keys(searchResult).map((i) => {
      return {
        id: i,
        title: searchResult[i].title,
        distance: searchResult[i].distance
      }
    })
    searchResultList = searchResultList.sort((a, b) => {
      return searchResult[a.id].distance - searchResult[b.id].distance
    })
  }

  function debounceSearch(): void {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async (): Promise<void> => {
      try {
        if (searchQuery.length) {
          const response = await fetch(baseUrl + endpoints.searchDocument + '/' + searchQuery, {
            method: 'GET',
            headers: {
              cors: 'no-cors'
            }
          })
          if (response.ok) {
            const data = await response.json()
            console.log(data)
            const results: SearchResultsType = {}
            for (let i = 0; i < data.ids[0].length; i++) {
              results[data.ids[0][i]] = data.metadatas[0][i]
              results[data.ids[0][i]].distance = data.distances[0][i]
            }
            searchResult = results
          } else if (!response.ok && response.status === 503) {
            await new Promise((resolve) => setTimeout(resolve, 2000))
            debounceSearch()
          } else {
            throw new Error(`Server is down with status ${response.status}`)
          }
        }
      } catch (error) {
        console.error(error)
      }
    }, 1000)
  }
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
  {#if searchResultList.length !== 0}
    <div
      class="flex flex-col rounded-lg backdrop-blur-lg border border-border max-h-56 min-h-fit invisible group-focus-within/search:visible shadow-md shadow-border"
    >
      {#each searchResultList as result, index}
        <Button
          variant="ghost"
          class="rounded-none
                    {index === 0 ? 'rounded-t-lg' : ''}
                    {index === searchResultList.length - 1 ? 'rounded-b-lg' : ''}
                        "
        >
          {result.title}
        </Button>
        {#if index !== searchResultList.length - 1}
          <Separator />
        {/if}
      {/each}
    </div>
  {/if}
</div>
