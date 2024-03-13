<script lang="ts">
    import Search from "./Search.svelte";
    import Icon from "../assets/Icon.svg";

    import { Sun, Moon } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import { toggleMode } from "mode-watcher";

    $: model = "all-mpnet-base-v2";
</script>

<header class="fixed top-0 left-0 w-full h-16 px-10 z-50 backdrop-blur-sm">
    <div class="inner m-auto flex h-full w-full items-center py-3 gap-2">
        <div class="icon h-full w-10">
            <img src={Icon} alt="Icon" class="h-full w-full" />
        </div>
        <Search />
        <div class="model-selector flex ml-auto">
            <button class="opacity-50 hover:opacity-100">
                <!-- <img src={unfoldMore} alt="Model Selector button" /> -->
            </button>
            <div class="model leading-10">{model}</div>
        </div>
        <Button on:click={toggleMode} size="icon">
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
