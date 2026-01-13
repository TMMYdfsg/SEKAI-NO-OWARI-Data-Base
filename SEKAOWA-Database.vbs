' SEKAI NO OWARI Database - Silent Launcher
' ダブルクリックでサーバーを起動し、ブラウザを開きます
' コンソールウィンドウを表示しません

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' スクリプトのあるディレクトリを取得
scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptPath

' ポート3000が使用中かチェック
Set exec = WshShell.Exec("cmd /c netstat -an | findstr "":3000.*LISTENING""")
result = exec.StdOut.ReadAll

If InStr(result, "3000") > 0 Then
    ' 既に起動中 - ブラウザを開くだけ
    WshShell.Run "http://localhost:3000", 1, False
Else
    ' サーバーを起動（ウィンドウを最小化）- 開発用の npm run dev を使用
    WshShell.Run "cmd /c npm run dev", 7, False
    
    ' サーバーの起動を待つ（最大30秒）
    For i = 1 To 30
        WScript.Sleep 1000
        Set exec2 = WshShell.Exec("cmd /c netstat -an | findstr "":3000.*LISTENING""")
        result2 = exec2.StdOut.ReadAll
        If InStr(result2, "3000") > 0 Then Exit For
    Next
    
    ' ブラウザを開く
    WScript.Sleep 1000
    WshShell.Run "http://localhost:3000", 1, False
End If
