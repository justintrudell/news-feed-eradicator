import { Show, type ParentComponent } from "solid-js";
import type { SnoozeMode } from "/storage/schema";
import { useOptionsPageState } from "../../state";
import { saveSnoozeMode, DEFAULT_SNOOZE_RATE_PER_SECOND, DEFAULT_SNOOZE_START_DELAY_SECONDS } from "/storage/storage";
import { LockedSettingsOverlay, SettingsLockFooter } from "../../lock";

const SnoozeModeOption: ParentComponent<{ mode: SnoozeMode, title: string }> = ({ mode, title, children }) => {
	const state = useOptionsPageState();

	const onClick = async () => {
		await saveSnoozeMode(mode);
		state.snoozeMode.refetch();
	}

	return <li class="bg-darken-100 rounded">
		<label class={`block p-4 space-y-2 cursor-pointer ${state.snoozeMode.get() === mode ? 'outlined' : 'hoverable'}`}>
			<div class="flex gap-1">
				<input type="radio" class="radio" name="snooze-mode" disabled={state.settingsLockedDown()} checked={state.snoozeMode.get() === mode} onClick={onClick} />
				<div class="space-y-1">
					<span class="flex-1">{ title }</span>
					<div class="text-secondary font-sm ml-4">
						{ children }
					</div>
				</div>
			</div>
		</label>
	</li>
}

export const SnoozeTabContent = () => {
	const state = useOptionsPageState();

	return (
		<div>
			<div class="p-4 space-y-4 overlay-container">
				<ul class="space-y-2 z1 blur-disabled" aria-disabled={state.settingsLockedDown()}>
					<SnoozeModeOption mode="hold" title="Hold to snooze">
						Requires you to hold the snooze button down for a while to start snoozing. The longer you hold, the longer the snooze.
					</SnoozeModeOption>

					<SnoozeModeOption mode="instant" title="Instant snooze">
						Not worried about your self-control? With this option you can just hit a button to start snoozing instantly.
					</SnoozeModeOption>
				</ul>

				<Show when={state.snoozeMode.get() === 'hold'}>
					<div class="space-y-4 z1 blur-disabled" aria-disabled={state.settingsLockedDown()}>
						<div class="space-y-1">
							<label class="block font-sm">Seconds to hold before the snooze timer starts counting</label>
							<input
								type="number"
								min="0"
								step="1"
								class="p-2 bg-darken-100 rounded"
								style="width: 8rem"
								disabled={state.settingsLockedDown()}
								value={state.storage.snoozeStartDelaySeconds.get() ?? DEFAULT_SNOOZE_START_DELAY_SECONDS}
								onChange={e => {
									const value = Math.max(0, Math.floor(Number(e.currentTarget.value)));
									if (Number.isFinite(value)) state.storage.setSnoozeStartDelaySeconds(value);
								}}
							/>
						</div>
						<div class="space-y-1">
							<label class="block font-sm">Snooze seconds earned per second held</label>
							<input
								type="number"
								min="1"
								step="1"
								class="p-2 bg-darken-100 rounded"
								style="width: 8rem"
								disabled={state.settingsLockedDown()}
								value={state.storage.snoozeRatePerSecond.get() ?? DEFAULT_SNOOZE_RATE_PER_SECOND}
								onChange={e => {
									const value = Math.max(1, Math.floor(Number(e.currentTarget.value)));
									if (Number.isFinite(value)) state.storage.setSnoozeRatePerSecond(value);
								}}
							/>
						</div>
					</div>
				</Show>
				<LockedSettingsOverlay />
			</div>
			<SettingsLockFooter />
		</div>
	);
};
