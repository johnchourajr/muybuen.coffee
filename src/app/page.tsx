"use client"

import PageHeader from "@/components/page-header"
import { SearchContainer } from "@/components/search-container"
import { Suspense } from "react"

export default function FindPage() {
  return (
    <>
      <PageHeader>
        Find Buen <br />
        Coffee
      </PageHeader>
      <Suspense fallback={<></>}>
        <SearchContainer />
      </Suspense>
    </>
  )
}
