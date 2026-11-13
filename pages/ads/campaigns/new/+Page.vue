<script setup lang="ts">
// A new campaign. Once step 1 makes the draft, the address carries its id
// (`?id=…&step=…`), so a reload carries on where it was.
import { onMounted, ref } from "vue";
import AdsShell from "../../../../components/ads/AdsShell.vue";
import CampaignWizard from "../../../../components/ads/CampaignWizard.vue";

const title = ref("New campaign");
onMounted(() => {
	if (new URLSearchParams(location.search).has("id")) title.value = "Edit campaign";
});
</script>

<template>
	<AdsShell :title="title">
		<CampaignWizard />
	</AdsShell>
</template>
