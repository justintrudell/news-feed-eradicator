import { createMemo, createSignal, Show, type ParentComponent } from "solid-js";
import { displayDuration } from "../../lib/time";
import { useOptionsPageState } from "./state";
import { DAY, HOUR, MINUTE } from "/lib/time";
import { DEFAULT_SNOOZE_RATE_PER_SECOND, DEFAULT_SNOOZE_START_DELAY_SECONDS } from "/storage/storage";

type SnoozePendingInfo = {
	secondsEarned: number;
	pendingProgress: number;
}

export const HoldSnoozeButton = () => {
	const state = useOptionsPageState();

	const [buttonHeldSince, setButtonHeldSince] = createSignal<number | null>(null);

	const timeHeld = createMemo(() => {
		const since = buttonHeldSince();
		if (since == null) return null;

		return (state.clock.get() - since) / 1000;
	});

	const snoozePendingInfo = createMemo((): SnoozePendingInfo | null => {
		const holdTime = timeHeld();
		if (holdTime == null) return null;

		const startDelay = state.storage.snoozeStartDelaySeconds.get() ?? DEFAULT_SNOOZE_START_DELAY_SECONDS;
		const ratePerSecond = state.storage.snoozeRatePerSecond.get() ?? DEFAULT_SNOOZE_RATE_PER_SECOND;

		// Phase 1: still within the start delay — nothing earned yet, just fill the progress bar.
		if (holdTime < startDelay) {
			return { secondsEarned: 0, pendingProgress: startDelay > 0 ? holdTime / startDelay : 1 };
		}

		// Phase 2: past the delay — earn `ratePerSecond` snooze-seconds for every second held.
		return { secondsEarned: Math.round((holdTime - startDelay) * ratePerSecond), pendingProgress: 1 };
	});

	const buttonDown = (e: { button: number, preventDefault: () => void }) => {
		if (e.button !== 0) return;
		setButtonHeldSince(state.clock.get());
	};

	const buttonUp = async (e: { button: number }) => {
		if (e.button !== 0) return;
		const { secondsEarned } = snoozePendingInfo() ?? {};
		if (secondsEarned != null && secondsEarned > 0) {
			await state.startSnooze(1000 * secondsEarned);
		}
		setButtonHeldSince(null);
	};

	const snoozeButtonLabel = () => {
		const { secondsEarned } = snoozePendingInfo() ?? {};
		if (secondsEarned == null) return 'Press and hold to snooze';
		if (secondsEarned === 0) return 'Keep holding...';

		return `Snooze for ${displayDuration(secondsEarned * 1000)}`;
	}

	const snoozeButtonTransform = () => {
		const { pendingProgress } = snoozePendingInfo() ?? {};
		if (pendingProgress == null) return 'scaleX(0)';
		return `scaleX(${pendingProgress})`;
	}

	return <button class="primary font-lg p-8 overlay-container isolate" style="width: 300px" onMouseDown={buttonDown} onMouseUp={buttonUp} onContextMenu={e => e.preventDefault()} onMouseLeave={buttonUp}>
		<div class="z1 overlay bg-accent transform-origin-left" style={`transform: ${snoozeButtonTransform()}`} />
		<div class="z2 position-relative">
			{snoozeButtonLabel()}
		</div>
	</button>
}

const InstantSnoozeButton: ParentComponent<{ ms: number, primary?: boolean }> = ({ms, primary, children}) => {
	const state = useOptionsPageState();

	const onClick = async () => {
		await state.startSnooze(ms);
	}

	return <button class={`${primary ? 'primary' : 'tertiary'} font-lg p-4`} onClick={onClick}>{children}</button>
}

const InstantSnoozeButtons = () => {
		return <div class="flex gap-2 cross-center card outlined shadow p-4">
			<div class="text-secondary">Snooze for</div>
			<InstantSnoozeButton ms={MINUTE}>1m</InstantSnoozeButton>
			<InstantSnoozeButton ms={2 * MINUTE}>2m</InstantSnoozeButton>
			<InstantSnoozeButton ms={5 * MINUTE}>5m</InstantSnoozeButton>
			<InstantSnoozeButton primary ms={10 * MINUTE}>10m</InstantSnoozeButton>
			<InstantSnoozeButton ms={30 * MINUTE}>30m</InstantSnoozeButton>
			<InstantSnoozeButton ms={HOUR}>1h</InstantSnoozeButton>
			<InstantSnoozeButton ms={DAY}>24h</InstantSnoozeButton>
		</div>
}

export const Snooze = () => {
	const state = useOptionsPageState();

	const isSnoozing = () => {
		const snoozeState = state.snoozeState.get();
		return snoozeState != null && snoozeState > state.clock.get();
	}

	return <div>
		<Show when={!isSnoozing()}>
			<div class="flex axis-center">
				<Show when={state.snoozeMode.get() === 'hold'}>
					<HoldSnoozeButton />
				</Show>
				<Show when={state.snoozeMode.get() === 'instant'}>
					<InstantSnoozeButtons />
				</Show>
			</div>
		</Show>

		<Show when={isSnoozing()}>
			<div class="flex cross-center p-4 card secondary outlined shadow">
				<div class="flex-1">
					💤 Snoozing for {displayDuration((state.snoozeState.get()! - state.clock.get()))}. Scroll your life away!
				</div>
				<button class="secondary" onClick={() => state.cancelSnooze()}>
					Cancel snooze
				</button>
			</div>
		</Show>
	</div>
}
