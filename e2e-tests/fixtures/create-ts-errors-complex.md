Tests delete-rename-write order
<crea-delete path="src/main.tsx">
</crea-delete>
<crea-rename from="src/App.tsx" to="src/main.tsx">
</crea-rename>
<crea-write path="src/main.tsx" description="final main.tsx file.">
finalMainTsxFileWithError();
</crea-write>
EOM
