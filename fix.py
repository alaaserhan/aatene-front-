import re

file_path = "src/features/(dashboard)/products/components/ProductViewPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# We want to find the exact block starting from `{!raw.short_description && !raw.description && (`
# all the way to the first occurrence of `{/* ── Modals ── */}`

target_start = "{!raw.short_description && !raw.description && ("
target_end = "{/* ── Modals ── */}"

start_idx = content.find(target_start)
end_idx = content.find(target_end)

if start_idx != -1 and end_idx != -1:
    before = content[:start_idx]
    after = content[end_idx:]
    
    replacement = """{!raw.short_description && !raw.description && (
                                                <p className="text-gray-2 text-sm">لا يوجد وصف للمنتج</p>
                                            )}
                                        </div>
                                    )}
                                    {activeTab === "reviews" && (
                                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                            <ProductReviewsSection
                                                slug={raw.slug || String(raw.id)}
                                                summary={{
                                                    count: Number(raw.review_count) || 0,
                                                    rate: Number(raw.review_rate) || 0,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2 lg:sticky lg:top-6">
                        <div className="bg-white rounded-2xl border border-gray-100 h-fit overflow-hidden shadow-sm p-6">
                            {/* Contact Buttons */}
                            <div className="flex flex-col gap-3 mt-4">
                                <Button className="w-full bg-[#133816] hover:bg-[#0f2d12] text-white font-bold h-12 rounded-lg flex items-center justify-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-[#C2ED2B]" />
                                    <span dir="ltr">{store?.phone?.replace(/^\\+?(\\d{3}).*/, "+$1 *** *** ***") || "+972 *** *** ***"}</span>
                                </Button>
                                <Button variant="outline" className="w-full border-[#133816] text-[#133816] hover:bg-[#133816]/5 bg-transparent font-bold h-12 rounded-lg flex items-center justify-center gap-2 text-sm">
                                    <span>دردشة</span>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            """
    
    new_content = before + replacement + after
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Fixed ProductViewPage.tsx")
else:
    print("Could not find the target blocks.")
