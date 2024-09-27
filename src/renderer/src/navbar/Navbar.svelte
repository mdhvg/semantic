<script lang="ts">
  import Search from './Search.svelte'
  import Icon from '../assets/Icon.svelte'

  import { ChevronDown } from 'lucide-svelte'

  import { Sun, Moon } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'
  import { toggleMode } from 'mode-watcher'
  export let activeDocumentId: string

  //$: selectedModel = 'all-mpnet-base-v2'
</script>

<header class="fixed top-0 left-0 w-full h-16">
  <div class="inner m-auto flex w-full h-full py-3 gap-2 px-10">
    <Icon class="icon h-full w-10 ml-10" />
    <Search bind:activeDocumentId class="ml-10" />
    <!-- <Popover.Root bind:open let:ids>
            <Popover.Trigger asChild let:builder>
                <Button
                    builders={[builder]}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    class="ml-auto"
                >
                    <ChevronDown />
                    {selectedModel}
                </Button>
            </Popover.Trigger>
            <Popover.Content class="w-fit p-0">
                <Command.Root>
                    <Command.Input placeholder="Search for model..." />
                    <Command.Empty>No framework found.</Command.Empty>
                    <Command.Group class="overflow-auto">
                        {#each models as model}
                            <Command.Item
                                value={framework.value}
                                onSelect={(currentValue) => {
                                    value = currentValue;
                                    closeAndFocusTrigger(ids.trigger);
                                }}
                            >
                                {framework.label}
                            </Command.Item>
                        {/each}
                    </Command.Group>
                </Command.Root>
            </Popover.Content>
        </Popover.Root> -->
    <Button on:click={toggleMode} class="ml-auto" variant="secondary" size="icon">
      <Sun
        class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <Moon
        class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
      <span class="sr-only">Toggle theme</span>
    </Button>
  </div>
</header>
