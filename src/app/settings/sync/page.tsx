"use client";

import { Wifi, Smartphone, Monitor, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SyncSettingsPage() {
    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="max-w-3xl mx-auto space-y-12">

                {/* Header */}
                <div className="space-y-4">
                    <Link
                        href="/settings"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        設定に戻る
                    </Link>
                    <h1 className="text-4xl font-bold font-serif text-primary">
                        デバイス同期・共有
                    </h1>
                    <p className="text-muted-foreground">
                        同じWi-Fiネットワーク内の他のデバイスから、このデータベースにアクセスする方法です。
                    </p>
                </div>

                {/* Network Info Config */}
                <div className="bg-card border border-white/10 rounded-xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-4 text-blue-400 mb-2">
                        <Wifi size={32} />
                        <h2 className="text-xl font-bold">アクセス方法</h2>
                    </div>

                    <div className="space-y-4">
                        <p className="leading-relaxed">
                            このPC（ホスト）のローカルIPアドレスを確認し、スマートフォンやタブレットのブラウザのURLバーに入力してください。
                        </p>

                        <div className="bg-black/50 p-4 rounded-lg font-mono text-sm border border-white/10 overflow-x-auto">
                            <span className="text-green-400">$</span> ipconfig (Windows) / ifconfig (Mac)<br />
                            <span className="text-gray-500">... IPv4 Address. . . . . . . . . . . : </span>
                            <span className="text-yellow-400 font-bold">192.168.1.XX</span>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                            <h3 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                                <Smartphone size={18} />
                                スマホでの入力例
                            </h3>
                            <p className="text-xl font-mono text-white">
                                http://192.168.1.XX:3000
                            </p>
                        </div>
                    </div>
                </div>

                {/* Simultaneous Editing Warning */}
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6 md:p-8">
                    <div className="flex items-center gap-4 text-yellow-500 mb-4">
                        <AlertTriangle size={32} />
                        <h2 className="text-xl font-bold">同時編集についての注意</h2>
                    </div>

                    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                        <p>
                            このアプリケーションは簡易的なローカルデータベースを使用しています。<br />
                            複数のデバイスで<strong>同時にデータを編集（追加・更新・削除）</strong>すると、最新の変更のみが保存され、他の人の変更が上書きされる可能性があります。
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>閲覧は同時に行っても問題ありません。</li>
                            <li>編集作業は、一度に一人のユーザーが行うことを推奨します。</li>
                            <li>「設定」＞「バックアップ」から定期的にデータを保存してください。</li>
                        </ul>
                    </div>
                </div>

                {/* Host/Client Diagram */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">
                        <Monitor size={48} className="text-purple-400 mb-4" />
                        <h3 className="font-bold text-lg mb-2">ホスト (PC)</h3>
                        <p className="text-sm text-muted-foreground">
                            npm run dev を実行中。<br />
                            データの実体はこのPCにあります。
                        </p>
                    </div>
                    <div className="bg-card border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">
                        <Smartphone size={48} className="text-pink-400 mb-4" />
                        <h3 className="font-bold text-lg mb-2">クライアント (スマホ等)</h3>
                        <p className="text-sm text-muted-foreground">
                            Wi-Fi経由でホストに接続。<br />
                            閲覧や、リビングでの鑑賞・クイズに最適。
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
