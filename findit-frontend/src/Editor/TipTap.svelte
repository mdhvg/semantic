<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import {
        Bold,
        Italic,
        Code2,
        Strikethrough,
        Heading1,
        Heading2,
        Heading3,
        Heading4,
        Heading5,
        Heading6,
    } from "lucide-svelte";

    let element: HTMLElement;
    let editor: Editor | null = null;

    onMount(() => {
        editor = new Editor({
            element: element,
            extensions: [StarterKit],
            content: "Hello World! 🌍️",
            onTransaction: () => {
                editor = editor;
            },
            editorProps: {
                attributes: {
                    class: "focus-within:outline-none w-full h-full",
                },
            },
        });
        console.log(JSON.stringify(editor.getJSON()));
        console.log(editor.getHTML());
        console.log(editor.getText());
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
    });
</script>

<div class="w-full mt-16 border border-gray-400 relative flex flex-col">
    <section
        class="flex items-center flex—wrap gap—x-4 border border-b-gray-400 p-2 w-full overflow-x-auto gap-2"
    >
        {#if editor !== null}
            <button
                on:click={() =>
                    console.log && editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                class={editor.isActive("bold") ? "is-active" : ""}
            >
                <Bold />
            </button>
            <button
                on:click={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                class={editor.isActive("italic") ? "is-active" : ""}
            >
                <Italic />
            </button>
            <button
                on:click={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                class={editor.isActive("strike") ? "is-active" : ""}
            >
                <Strikethrough />
            </button>
            <button
                on:click={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                class={editor.isActive("code") ? "is-active" : ""}
            >
                <Code2 />
            </button>
            <button
                on:click={() => editor.chain().focus().unsetAllMarks().run()}
            >
                clear marks
            </button>
            <button on:click={() => editor.chain().focus().clearNodes().run()}>
                clear nodes
            </button>
            <button
                on:click={() => editor.chain().focus().setParagraph().run()}
                class={editor.isActive("paragraph") ? "is-active" : ""}
            >
                paragraph
            </button>
            <button
                on:click={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()}
                class={editor.isActive("heading", { level: 1 })
                    ? "is-active"
                    : ""}
            >
                <Heading1 />
            </button>
            <button
                on:click={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()}
                class={editor.isActive("heading", { level: 2 })
                    ? "is-active"
                    : ""}
            >
                <Heading2 />
            </button>
            <button
                on:click={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()}
                class={editor.isActive("heading", { level: 3 })
                    ? "is-active"
                    : ""}
            >
                <Heading3 />
            </button>
            <button
                on:click={() =>
                    editor.chain().focus().toggleHeading({ level: 4 }).run()}
                class={editor.isActive("heading", { level: 4 })
                    ? "is-active"
                    : ""}
            >
                <Heading4 />
            </button>
            <button
                on:click={() =>
                    editor.chain().focus().toggleHeading({ level: 5 }).run()}
                class={editor.isActive("heading", { level: 5 })
                    ? "is-active"
                    : ""}
            >
                <Heading5 />
            </button>
            <button
                on:click={() =>
                    editor.chain().focus().toggleHeading({ level: 6 }).run()}
                class={editor.isActive("heading", { level: 6 })
                    ? "is-active"
                    : ""}
            >
                <Heading6 />
            </button>
            <button
                on:click={() => editor.chain().focus().toggleBulletList().run()}
                class={editor.isActive("bulletList") ? "is-active" : ""}
            >
                bullet list
            </button>
            <button
                on:click={() =>
                    editor.chain().focus().toggleOrderedList().run()}
                class={editor.isActive("orderedList") ? "is-active" : ""}
            >
                ordered list
            </button>
            <button
                on:click={() => editor.chain().focus().toggleCodeBlock().run()}
                class={editor.isActive("codeBlock") ? "is-active" : ""}
            >
                code block
            </button>
            <button
                on:click={() => editor.chain().focus().toggleBlockquote().run()}
                class={editor.isActive("blockquote") ? "is-active" : ""}
            >
                blockquote
            </button>
            <button
                on:click={() =>
                    editor.chain().focus().setHorizontalRule().run()}
            >
                horizontal rule
            </button>
            <button
                on:click={() => editor.chain().focus().setHardBreak().run()}
            >
                hard break
            </button>
            <button
                on:click={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
            >
                undo
            </button>
            <button
                on:click={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
            >
                redo
            </button>
        {/if}
    </section>
    <div bind:this={element} class="py-1 w-full px-2 overflow-y-auto"></div>
</div>
