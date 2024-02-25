<script lang="ts">
    import unfoldMore from "../assets/unfold-more.svg";
    import Search from "./Search.svelte";
    import Icon from "../assets/Icon.svg";

    $: model = "all-mpnet-base-v2";
</script>

<header class="fixed top-0 left-0 w-full h-15 px-10">
    <div class="inner m-auto flex h-full w-full items-center py-3 gap-2">
        <div class="icon h-full w-10">
            <img src={Icon} alt="Icon" class="h-full w-full" />
        </div>
        <Search />
        <div class="model-selector flex ml-auto">
            <button class="opacity-50 hover:opacity-100">
                <img src={unfoldMore} alt="Model Selector button" />
            </button>
            <div class="model leading-10">{model}</div>
        </div>
    </div>
</header>
