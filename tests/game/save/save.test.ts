import { describe, it, expect, beforeEach } from 'vitest'
import { encodeShareString, createCompletedRun } from '../../../src/game/save/serialize'
import { parseShareString } from '../../../src/game/save/deserialize'
import { checkCodexUnlocks } from '../../../src/game/save/codex'
import {
  saveToDisk,
  loadFromDisk,
  saveCodex,
  loadCodex,
  saveSettings,
  loadSettings,
} from '../../../src/game/save/storage'
import { Archetype, RunPhase } from '../../../src/types/enums'
import { EMPTY_STATS } from '../../../src/types/stats'
import type { ConstellationNode } from '../../../src/types/nodes'
import type { RunState } from '../../../src/types/run'
import type { CompletedRun as CompletedRunType, CodexState as CodexStateType, SaveState as SaveStateType } from '../../../src/types/save'

function makeConstellationNode(
  id: string,
  column: number,
  y: number,
  x: number,
): ConstellationNode {
  return {
    defId: `def_${id}`,
    id,
    x,
    y,
    column,
    edges: [],
    purchased: false,
    locked: false,
  }
}

function buildRunState(overrides: Partial<RunState> = {}): RunState {
  const node0 = makeConstellationNode('node_0', 0, 0, 0)
  const node1 = makeConstellationNode('node_1', 1, 0, 10)
  const node2 = makeConstellationNode('node_2', 2, 0, 20)
  const node3 = makeConstellationNode('node_3', 3, 0, 30)
  const node4 = makeConstellationNode('node_4', 1, 5, 10)
  const node5 = makeConstellationNode('node_5', 2, 5, 20)
  const nodes = new Map<string, ConstellationNode>()
  for (const n of [node0, node1, node2, node3, node4, node5]) {
    nodes.set(n.id, n)
  }

  return {
    seed: 'test-seed-abc-123',
    archetype: Archetype.SPORGK,
    turn: 5,
    phase: RunPhase.DRAFT,
    stats: { ...EMPTY_STATS },
    baseStats: { ...EMPTY_STATS },
    gold: 200,
    constellation: {
      nodes,
      startNodeId: 'node_0',
      anchorNodeIds: ['node_0'],
    },
    draftedNodeIds: ['node_1', 'node_3', 'node_5'],
    inventory: [],
    abilities: [],
    currentNodeDrafts: 1,
    extraNodeDrafts: 0,
    storeItems: [],
    storeRerolled: false,
    encounters: [],
    combatLog: [],
    lastResult: null,
    runEnded: false,
    shareString: '',
    ...overrides,
  }
}

// ===============================================================
// serialize.ts tests
// ===============================================================

describe('encodeShareString', () => {
  it('produces a string starting with ANTIGRAV/', () => {
    const state = buildRunState()
    const result = encodeShareString(state)
    expect(result.startsWith('ANTIGRAV/')).toBe(true)
  })

  it('includes the archetype abbreviation and seed prefix', () => {
    const state = buildRunState({ seed: 'my-special-seed-999' })
    const result = encodeShareString(state)
    const parts = result.split('/')
    expect(parts.length).toBeGreaterThanOrEqual(3)
    const segment2 = parts[1]
    expect(segment2).toContain('SPRGK')
    expect(segment2).toContain('MYSPECIA')
  })

  it('filters seed to alphanumeric and uppercases', () => {
    const state = buildRunState({ seed: 'a_b-c!d@e#f$g%h' })
    const result = encodeShareString(state)
    const parts = result.split('/')
    const seed8 = parts[1].split('-')[1]
    expect(seed8).toBe('ABCDEFGH')
    expect(seed8.length).toBeLessThanOrEqual(8)
  })

  it('is under 100 characters', () => {
    const state = buildRunState({
      draftedNodeIds: ['node_0', 'node_1', 'node_2', 'node_3', 'node_4', 'node_5'],
    })
    const result = encodeShareString(state)
    expect(result.length).toBeLessThan(100)
  })

  it('produces the same string for the same state (deterministic)', () => {
    const state = buildRunState()
    const r1 = encodeShareString(state)
    const r2 = encodeShareString(state)
    expect(r1).toBe(r2)
  })

  it('produces different strings for different draft picks', () => {
    const state1 = buildRunState({ draftedNodeIds: ['node_1', 'node_2'] })
    const state2 = buildRunState({ draftedNodeIds: ['node_1', 'node_3'] })
    expect(encodeShareString(state1)).not.toBe(encodeShareString(state2))
  })

  it('produces different strings for different seeds', () => {
    const state1 = buildRunState({ seed: 'seed-aaa' })
    const state2 = buildRunState({ seed: 'seed-bbb' })
    expect(encodeShareString(state1)).not.toBe(encodeShareString(state2))
  })

  it('produces different strings for different archetypes', () => {
    const state1 = buildRunState({ archetype: Archetype.SPORGK })
    const state2 = buildRunState({ archetype: Archetype.ELF })
    expect(encodeShareString(state1)).not.toBe(encodeShareString(state2))
  })

  it('encodes vampire archetype as VAMP', () => {
    const state = buildRunState({ archetype: Archetype.VAMPIRE })
    const result = encodeShareString(state)
    const archPart = result.split('/')[1].split('-')[0]
    expect(archPart).toBe('VAMP')
  })

  it('uses Z for nodes not found in constellation', () => {
    const state = buildRunState({ draftedNodeIds: ['nonexistent_node'] })
    const result = encodeShareString(state)
    const draftSeq = result.split('/')[3]  // [3] = draft seq under new 4-part format
    expect(draftSeq).toBe('Z')
  })

  it('encodes empty draft sequence as empty string', () => {
    const state = buildRunState({ draftedNodeIds: [] })
    const result = encodeShareString(state)
    const draftSeq = result.split('/')[3]  // [3] = draft seq under new 4-part format
    expect(draftSeq).toBe('')
  })
})

describe('createCompletedRun', () => {
  it('creates a CompletedRun with a unique ID', () => {
    const state = buildRunState({ turn: 10 })
    const run1 = createCompletedRun(state)
    const run2 = createCompletedRun(state)
    expect(run1.id).toBeTruthy()
    expect(run2.id).toBeTruthy()
    expect(run1.id).not.toBe(run2.id)
  })

  it('sets passed correctly when lastResult exists and pass is true', () => {
    const state = buildRunState({
      turn: 8,
      runEnded: true,
      lastResult: {
        pass: true,
        damageDealt: 500,
        threshold: 400,
        deficit: 100,
        stingerVariant: 'PASS' as any,
      },
    })
    const run = createCompletedRun(state)
    expect(run.passed).toBe(true)
  })

  it('sets passed to false when lastResult pass is false', () => {
    const state = buildRunState({
      turn: 5,
      runEnded: true,(����������I��ձ���(������������聙��͔�(�����������������������(��������ѡɕ͡��������(��������������������(���������ѥ����Y�ɥ���耝%0���́���(��������(������(��������Ё�ո��ɕ�ѕ�����ѕ�Iո��хє�(���������С�ո����͕���ѽ	�����͔�(����((���Р��ɕ͕�ٕ́ѡ��͡�ɔ���ɥ������������(��������Ё�хє��ե��IչMхє����ɸ��ȁ��(��������Ё�ո��ɕ�ѕ�����ѕ�Iո��хє�(���������С�ո�͡�ɕM�ɥ����ѽ	��������M��ɕM�ɥ����хє��(����((���Р��ɕ͕�ٕ́�Ʌ�ѕ�9���%�̜���������(��������Ё�хє��ե��IչMхє�쁑Ʌ�ѕ�9���%���l�����|Ĝ�������|ȝt���(��������Ё�ո��ɕ�ѕ�����ѕ�Iո��хє�(���������С�ո��Ʌ�ѕ�9���%�̤�ѽ�Յ��l�����|Ĝ�������|ȝt�(����)��(((������������������������������������������������������������������(�����͕ɥ���锹�́ѕ���(������������������������������������������������������������������()��͍ɥ�������͕M��ɕM�ɥ������������(���Р����͕́��م����͡�ɔ���ɥ������ɕ�ѱ䜰��������(��������Ёɕ�ձЀ����͕M��ɕM�ɥ����9Q%IX�MAI,�	 ����h��(���������Сɕ�ձй����ѽ	����Ք�(��������ɕ�ձй�����(�����������Сɕ�ձй��ф��ɍ��������ѽ	��ɍ�������MA=I,�(�����������Сɕ�ձй��ф�͕����ѽ	���	 ��(�����������Сɕ�ձй��ф��Ʌ��M�Ĥ�ѽ	������h��(�����(����((���Р����͕́1��ɍ����������������(��������Ёɕ�ձЀ����͕M��ɕM�ɥ����9Q%IX�1���������	��(���������Сɕ�ձй����ѽ	����Ք�(��������ɕ�ձй�����(�����������Сɕ�ձй��ф��ɍ��������ѽ	��ɍ�������1�(�����(����((���Р����͕́Y5@��ɍ����������������(��������Ёɕ�ձЀ����͕M��ɕM�ɥ����9Q%IX�Y5@�M���нaeh��(���������Сɕ�ձй����ѽ	����Ք�(��������ɕ�ձй�����(�����������Сɕ�ձй��ф��ɍ��������ѽ	��ɍ�������Y5A%I�(�����(����((���Р�ɕ��ɹ́��ɽȁ��ȁ����9Q%IX�х�����������(��������Ёɕ�ձЀ����͕M��ɕM�ɥ����=Q!H�MAI,�M�IP��(���������Сɕ�ձй����ѽ	�����͔�(���������ɕ�ձй���������Сɕ�ձй��ɽȹ������ѽ	��������ɵ����(����((���Р�ɕ��ɹ́��ɽȁ��ȁ���ͥ���͕�����̜���������(���������С���͕M��ɕM�ɥ����9Q%IX�MAI,�M�������ѽ	�����͔�(���������С���͕M��ɕM�ɥ����9Q%IX�������ѽ	�����͔�(����((���Р�ɕ��ɹ́��ɽȁ��ȁչ���ݸ��ɍ����������ɕ٥�ѥ������������(��������Ёɕ�ձЀ����͕M��ɕM�ɥ����9Q%IX�aaa`�M���нIP��(���������Сɕ�ձй����ѽ	�����͔�(���������ɕ�ձй���������Сɕ�ձй��ɽȹ������ѽ	�����م���}�ɍ��������(����((���Р�ɕ��ɹ́��ɽȁ��ȁ���ͥ���͕��Ʌѽȁ���͕����ЀȜ���������(��������Ёɕ�ձЀ����͕M��ɕM�ɥ����9Q%IX�MAI-	 �IP��(���������Сɕ�ձй����ѽ	�����͔�(���������ɕ�ձй���������Сɕ�ձй��ɽȹ������ѽ	��������ɵ����(����((���Р�ɕ��ɹ́��ɽȁ��ȁ�����͕������������(��������Ёɕ�ձЀ����͕M��ɕM�ɥ����9Q%IX�MAI,��IP��(���������Сɕ�ձй����ѽ	�����͔�(���������ɕ�ձй���������Сɕ�ձй��ɽȹ������ѽ	�����م���}͕����(����((���Р�ɕ��ɹ́��ɽȁ��ȁ�ձ��չ������������М���������(���������С���͕M��ɕM�ɥ����ձ���́��䤹����ѽ	�����͔�(���������С���͕M��ɕM�ɥ���չ���������́��䤹����ѽ	�����͔�(����((���Р��ɕ͕�ٕ́�Ʌ�Ё͕�Օ����ݥѠ��ձѥ����ͱ�͡�̜���������(��������Ёɕ�ձЀ����͕M��ɕM�ɥ����9Q%IX�1�M���нI�QaQI��(���������Сɕ�ձй����ѽ	����Ք�(��������ɕ�ձй���������Сɕ�ձй��ф��Ʌ��M�Ĥ�ѽ	���IP�aQI��(����)��((������������������������������������������������������������������(���������́ѕ���(������������������������������������������������������������������()�չ�ѥ������������ѕ�Iո��ٕ�ɥ����A��ѥ��������ѕ�IչQ���������������ѕ�IչQ�����(��ɕ��ɸ��(������耝�ո���Ĝ�(����͕��耝ѕ�е͕����(�����ɍ�������ɍ�������MA=I,�(������ɹI����������(�������͕����Ք�(�����������=�5�ɝ������(�����Ʌ�ѕ�9���%���mt�(����͡�ɕM�ɥ��耜��(����ѥ���х����є���ܠ��(��������ٕ�ɥ��̰(���)�()�չ�ѥ�����������Mхє��ٕ�ɥ����A��ѥ�������MхѕQ��������������MхѕQ�����(��ɕ��ɸ��(����չ������5���������mt�(����������ѕ�Iչ��mt�(���������ٕ������mt�(�����ե����mt�(��������ٕ�ɥ��̰(���)�()��͍ɥ�������������U�����̜���������(���Р�չ����́����ɥ��ݥ�}�ո��������ȁ���٥�ѽ�䜰��������(��������Ё�ո�􁵅�������ѕ�Iո�����͕����Ք���(��������Ё������􁵅������Mхє��(��������Ёչ����̀􁍡�������U�����̡�ո�������(���������Сչ����̤�ѽ��х�������}��Չ��}�Ʌ�М�(����((���Р�չ����́�ɍ����������������ݥ�}�ո��������Ȝ���������(��������Ё�ո�􁵅�������ѕ�Iո�����͕����Ք���ɍ�������ɍ�������MA=I,���(��������Ё������􁵅������Mхє��(��������Ёչ����̀􁍡�������U�����̡�ո�������(���������Сչ����̤��F�6��F��v��E��&�����FRr��Ґ���B�vF�W2��BV���6�w&��r�&6�WG�Rv���'V���F�f�W"r�������6��7B'V����T6���WFVE'V⇲76VC�G'VR�&6�WG�S�&6�WG�R�5�$t�Ґ�6��7B6�FW����T6�FW�7FFR���6��7BV���6�2�6�V6�6�FW�V���6�2�'V��6�FW���W�V7B�V���6�2����B�F�6��F��v��E�7'�7F�Ɩ�U�f�7W2r��W�V7B�V���6�2����B�F�6��F��v��E�f��E�F�V6�VBr��Ґ���B�wV���6�2&V6��GW&���F�f�W'2r�������6��7B'V����T6���WFVE'V⇲GW&�&V6�VC�b�76VC�f�6RҐ�6��7B6�FW����T6�FW�7FFR���6��7BV���6�2�6�V6�6�FW�V���6�2�'V��6�FW���W�V7B�V���6�2��F�6��F��v��E�v%�6�W7Br��W�V7B�V���6�2��F�6��F��v��E��V6���6�&�r��W�V7B�V���6�2��F�6��F��v��E�v��FV��w2r��W�V7B�V���6�2����۝Z[�	�[��[�\�[��I�B�JB��]
	��\���[�����XX��\���[��[YH��Y]	�

HO��ۜ��[�HXZ�P��\]Y�[��\���XX�Y�\��Y��[�HJB��ۜ���^HXZ�P��^�]J
B��ۜ�[�����H�X����^[������[���^
B�^X�
[�����K������۝Z[�	�[���\���\�	�B�^X�
[�����K������۝Z[�	�[��X��W��\�I�B�JB��]
	�[�����\��]\W��[[��H[�Y�Y\���

HO��ۜ��[�HXZ�P��\]Y�[�\��Y��YK�\��]\N�\��]\K��ԑ�\���XX�Y�MK�JB��ۜ���^HXZ�P��^�]J
B��ۜ�[�����H�X����^[������[���^
B�^X�
[�����K�toContain('mod_sporgk_berserker')
  })

  it('does not unlock archetype_challenge when wrong archetype', () => {
    const run = makeCompletedRun({
      passed: true,
      archetype: Archetype.ELF,
      turnReached: 15,
    })
    const codex = makeCodexState()
    const unlocks = checkCodexUnlocks(run, codex)
    expect(unlocks).not.�ѽ��х�������}���ɝ�}���͕ɭ�Ȝ�(���������Сչ����̤�F�6��F��v��E�V�e�7F'vVfW"r��Ґ���B�wV���6�2&�75�����v�V�'V�76VB�BGW&��2F�f�6�&�R'�Rr�������6��7B'V����T6���WFVE'V⇲76VC�G'VR�GW&�&V6�VC�RҐ�6��7B6�FW����T6�FW�7FFR���6��7BV���6�2�6�V6�6�FW�V���6�2�'V��6�FW���W�V7B�V���6�2��F�6��F��v��E�&�75�6��W"r��Ґ���B�vF�W2��BV���6�&�75�����v�V�'V�F�B��B72r�������6��7B'V����T6���WFVE'V⇲76VC�f�6R�GW&�&V6�VC�RҐ�6��7B6�FW����T6�FW�7FFR���6��7BV���6�2�6�V6�6�FW�V���6�2�'V��6�FW���W�V7B�V���6�2����B�F�6��F��v��E�&�75�6��W"r��Ґ���B�vF�W2��BV���6�&�75�����v�V�GW&���BF�f�6�&�R'�Rr�������6��7B'V����T6���WFVE'V⇲76VC�G'VR�GW&�&V6�VC�rҐ�6��7B6�FW����T6�FW�7FFR���6��7BV���6�2�6�V6�6�FW�V���6�2�'V��6�FW���W�V7B�V���6�2����B�F�6��F��v��E�&�75�6��W"r��Ґ���B�vF�W2��B&R�V���6��&VG��v�VB��F�f�W'2r�������6��7B'V����T6���WFVE'V⇲76VC�G'VR�GW&�&V6�VC�#�&6�WG�S�&6�WG�R�5�$t�Ґ�6��7B6�FW����T6�FW�7FFR��V���6�VD��F�f�W'3��v��E�F�V&�U�G&gBr�v��E��&�����FRu�Ґ�6��7BV���6�2�6�V6�6�FW�V���6�2�'V��6�FW���W�V7B�V���6�2����B�F�6��F��v��E�F�V&�U�G&gBr��W�V7B�V���6�2����B�F�6��F��v��E��&�����FRr��W�V7B�V���6�2��F�6��F��v��E�&�75�6��W"r��Ґ���B�vF�W2��BV���6����vV%�'V��"7FE�F�&W6���B�FVfW'&VB�r�������6��7B'V����T6���WFVE'V⇲76VC�G'VR�GW&�&V6�VC�#Ґ�6��7B6�FW����T6�FW�7FFR���6��7BV���6�2�6�V6�6�FW�V���6�2�'V��6�FW���W�V7B�V���6�2����B�F�6��F��v��E���VE�'&v�W"r��W�V7B�V���6�2����B�F�6��F��v��E�7G&��vV�F�r��W�V7B�V���6�2����B�F�6��F��v��E�6���V7F�"r��Ґ���B�w&WGW&�2V�G�'&�v�V���F���rV���6�2r�������6��7B'V����T6���WFVE'V⇲76VC�f�6R�GW&�&V6�VC�Ґ�6��7B6�FW����T6�FW�7FFR���6��7BV���6�2�6�V6�6�FW�V���6�2�'V��6�FW���W�V7B�V���6�2��F�WV�Ґ�Ґ�Ґ������������������������������������������������������������������Т��7F�&vR�G2FW7G0�����������������������������������������������������������������Р�gV�7F�����U6fU7FFR��fW'&�FW3�'F���6fU7FFUG�S���ғ�6fU7FFUG�R��&WGW&���fW'6�����'V��V����6�FW����V���6�VD��F�f�W'3��v��E�F�V&�U�G&gBu���6���WFVE'V�3�����6��WfV�V�G3��v6��7�&v��f�7F�'�u���'V��G3��������6WGF��w3���f��E6��S�#R��&VGV6VD��F���f�6R��V�6W'F��G���FS�f�6R��6�V�DV�&�VC�G'VR���W6�4V�&�VC�G'VR��6�V�Ef��V�S�����W6�5f��V�S��B���������fW'&�FW2��ЧР�FW67&�&R�w6fUF�F�6����Dg&��F�6�r�������&Vf�&TV6����������6�7F�&vR�6�V"���Ґ���B�w&�V�B�G&�26fU7FFR&W6W'f��r��f�V�G2r�������6��7B7FFR���U6fU7FFR���6fUF�F�6��7FFR��6��7B��FVB���Dg&��F�6����W�V7B���FVB����B�F�&T�V���W�V7B���FVB�fW'6����F�&R�7FFR�fW'6��␢W�V7B���FVB�6�FW��V���6�VD��F�f�W'2��F�WV7FFR�6�FW��V���6�VD��F�f�W'2��W�V7B���FVB�6�FW��6��WfV�V�G2��F�WV7FFR�6�FW��6��WfV�V�G2��W�V7B���FVB�6WGF��w2�f��E6��R��F�&R�7FFR�6WGF��w2�f��E6��R��W�V7B���FVB�6WGF��w2�6�V�DV�&�VB��F�&R�7FFR�6WGF��w2�6�V�DV�&�VB��Ґ���B�w&WGW&�2�V��v�V���6fRW��7G2r�������6��7B��FVB���Dg&��F�6����W�V7B���FVB��F�&T�V���Ґ���B�w&WGW&�2�V��f�"6�''WFVB�4��r���������6�7F�&vR�6WD�FV҂v�F�w&f�G��6fRr�v��B�fƖB֧6�緷�r��6��7B��FVB���Dg&��F�6����W�V7B���FVB��F�&T�V���Ґ���B�w&WGW&�2�V��f�"��fƖB6fRFF�w&��r66�V��r���������6�7F�&vR�6WD�FV҂v�F�w&f�G��6fRr��4���7G&��v�g���fW'6���ww&��rr�'V��V��Ғ��6��7B��FVB���Dg&��F�6����W�V7B���FVB��F�&T�V���Ґ���B�w&WGW&�2�V��f�"V�G��&�V7Br���������6�7F�&vR�6WD�FV҂v�F�w&f�G��6fRr��4���7G&��v�g���Ғ��6��7B��FVB���Dg&��F�6����W�V7B���FVB��F�&T�V���Ґ���B�v�fW'w&�FW2W��7F��r6fRr�������6��7B7FFS���U6fU7FFR��fW'6���Ґ�6��7B7FFS"���U6fU7FFR��fW'6���"Ґ�6fUF�F�6��7FFS��6fUF�F�6��7FFS"��6��7B��FVB���Dg&��F�6����W�V7B���FVB�fW'6����F�&R�"��Ґ�Ґ��FW67&�&R�w6fT6�FW����D6�FW�r�������&Vf�&TV6����������6�7F�&vR�6�V"���Ґ���B�w6fW2�B��G26�FW�7FFRr�������6��7B6�FW����V���6�VD��F�f�W'3��v��E��&�����FRr�v��E�F�V&�U�G&gBu���6���WFVE'V�3�����6��WfV�V�G3�����'V��G3�����Т6fT6�FW��6�FW���6��7B��FVB���D6�FW����W�V7B���FVB�V���6�VD��F�f�W'2��F�WV�v��E��&�����FRr�v��E�F�V&�U�G&gBuҐ�Ґ���B�w&WGW&�2FVfV�B6�FW�v�V���6fRW��7G2r�������6��7B��FVB���D6�FW����W�V7B���FVB�V���6�VD��F�f�W'2��F�WV�Ґ�W�V7B���FVB�6���WFVE'V�2��F�WV�Ґ�W�V7B���FVB�6��WfV�V�G2��F�WV�Ґ�W�V7B���FVB�'V��G2��F�WV�Ґ�Ґ���B�w&W6W'fW2�F�W"6fRFFv�V�WFF��r6�FW�r�������6��7B7FFR���U6fU7FFR���6fUF�F�6��7FFR���6��7B�Wt6�FW����V���6�VD��F�f�W'3��v��E�&�75�6��W"u���6���WFVE'V�3������C�w#r��6VVC�w2r��&6�WG�S�&6�WG�R�5�$t���GW&�&V6�VC�R��76VC�G'VR��FVf�6�D�$�&v����G&gFVD��FT�G3�����6�&U7G&��s�rr��F��W7F����������6��WfV�V�G3�����'V��G3�����Т6fT6�FW���Wt6�FW����6��7B��FVB���Dg&��F�6����W�V7B���FVB�6�FW��V���6�VD��F�f�W'2��F�WV�v��E�&�75�6��W"uҐ�W�V7B���FVB�6�FW��6���WFVE'V�2��V�wF���F�&R���W�V7B���FVB�6WGF��w2�f��E6��R��F�&R�7FFR�6WGF��w2�f��E6��R��Ґ�Ґ��FW67&�&R�w6fU6WGF��w2���E6WGF��w2r�������&Vf�&TV6����������6�7F�&vR�6�V"���Ґ���B�w6fW2�B��G26WGF��w2r�������6��7B6WGF��w2���f��E6��S�S26��7B��&VGV6VD��F���G'VR��V�6W'F��G���FS�G'VR��6�V�DV�&�VC�f�6R���W6�4V�&�VC�f�6R��6�V�Ef��V�S��R���W6�5f��V�S��"��Т6fU6WGF��w2�6WGF��w2��6��7B��FVB���E6WGF��w2���W�V7B���FVC��f��E6��R��F�&R�S��W�V7B���FVC��&VGV6VD��F����F�&R�G'VR��W�V7B���FVC��6�V�DV�&�VB��F�&R�f�6R��Ґ���B�w&WGW&�2�V��v�V���6WGF��w26fVBr�������6��7B��FVB���E6WGF��w2���W�V7B���FVB��F�&T�V���Ґ���B�w&W6W'fW2�F�W"6fRFFv�V�WFF��r6WGF��w2r�������6��7B7FFR���U6fU7FFR���6fUF�F�6��7FFR���6��7B�Wu6WGF��w2���f��E6��S�26��7B��&VGV6VD��F���G'VR��V�6W'F��G���FS�G'VR��6�V�DV�&�VC�G'VR���W6�4V�&�VC�f�6R��6�V�Ef��V�S��2���W6�5f��V�S����Т6fU6WGF��w2��Wu6WGF��w2���6��7B��FVB���Dg&��F�6����W�V7B���FVB�6WGF��w2�f��E6��R��F�&R���W�V7B���FVB�6�FW��V���6�VD��F�f�W'2��F�WV7FFR�6�FW��V���6�VD��F�f�W'2��Ґ�Ґ