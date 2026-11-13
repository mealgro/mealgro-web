<script setup lang="ts">
// Changing a campaign (`?id=…`): a draft, a rejected one to resubmit, or one
// already sent (some changes send it back to review; the wizard says which).
import AdsShell from "../../../../components/ads/AdsShell.vue";
import CampaignWizard from "../../../../components/ads/CampaignWizard.vue";
</script>

<template>
	<AdsShell title="Edit campaign">
		<CampaignWizard />
	</AdsShell>
</template>
