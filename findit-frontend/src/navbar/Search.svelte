<script lang="ts">
    import SearchIcon from "../assets/searchv2.svg";
</script>

<div
    class="search-wrapper flex h-full bg-gray-200 rounded-lg w-2/3 py-2 px-6 group items-center focus-within:bg-gray-400"
>
    <input
        type="text"
        name="search"
        id="search"
        class="h-full w-full rounded-lg px-2 py-1 bg-inherit hover:outline-none focus-visible:outline-none"
    />
    <img
        src={SearchIcon}
        alt="Search"
        class="opacity-50 group-hover:opacity-100 h-2/3"
    />
</div>
<!-- <form class="mx-auto flex w-10">
    <input
        class="hover:outline-none focus-visible:outline-none h-full border-solid border-2 border-gray-300 rounded-md p-2"
        type="search"
        name="search"
        id="search"
    />
    <button type="submit" class="opacity-50 hover:opacity-100 h-full w-full"
        ><img src={SearchIcon} alt="Search" /></button
    >
</form> -->
