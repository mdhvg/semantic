<script lang="ts">
  import { MoreVertical } from 'lucide-svelte'
  type DocumentProps = {
    title: string | null
    createdAt: string | null
    updatedAt: string | null
    starred: boolean
    color: string | null
  }
  export let document: DocumentProps

  function toggleStar() {
    document.starred = !document.starred
  }
</script>

<div class="flex flex-col h-fit w-full border-solid border-2 border-gray-300 rounded-md p-3">
  <div class="text">
    <h1 class="text-xl">{document.title}</h1>
    <p>{document.content}</p>
  </div>
  <div class="flex h-7">
    <button class="rounded-full h-full w-7" on:click={toggleStar}>
      <!-- <img
                src={document.starred ? starFill : starOutline}
                alt="star"
                class="h-5 m-auto opacity-50 hover:opacity-100"
            /> -->
    </button>
    <button class="opacity-50 hover:opacity-100 rounded-full ml-auto h-7 w-7">
      <MoreVertical class="h-5 m-auto" />
    </button>
  </div>
</div>
