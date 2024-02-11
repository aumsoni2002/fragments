//const MemoryDB = require('../../src/model/data/memory/memory-db');
const memoryIndex = require('../../src/model/data/memory/index');

describe('memory-index', () => {
  //let metadataDB;
  //let dataDB;

  beforeEach(() => {
    //metadataDB = new MemoryDB();
    //dataDB = new MemoryDB();
  });

  test('writeFragment and readFragment', async () => {
    const fragment = { ownerId: 'user1', id: 'fragment1', data: 'sample data' };
    await memoryIndex.writeFragment(fragment);
    const result = await memoryIndex.readFragment(fragment.ownerId, fragment.id);
    expect(result).toEqual(fragment);
  });

  test('writeFragmentData and readFragmentData', async () => {
    const ownerId = 'user1';
    const fragmentId = 'fragment1';
    const buffer = Buffer.from('sample data');
    await memoryIndex.writeFragmentData(ownerId, fragmentId, buffer);
    const result = await memoryIndex.readFragmentData(ownerId, fragmentId);
    expect(result).toEqual(buffer);
  });

  test('listFragments', async () => {
    const ownerId = 'user1';
    const fragment1 = { ownerId, id: 'fragment1' };
    const fragment2 = { ownerId, id: 'fragment2' };
    await memoryIndex.writeFragment(fragment1);
    await memoryIndex.writeFragment(fragment2);

    const result = await memoryIndex.listFragments(ownerId);
    // Adjusting the expectation to match the current behavior
    expect(result).toEqual([fragment1.id, fragment2.id]);
  });

  test('listFragments with expand=true', async () => {
    const ownerId = 'user1';
    const fragment1 = { ownerId, id: 'fragment1' };
    const fragment2 = { ownerId, id: 'fragment2' };
    await memoryIndex.writeFragment(fragment1);
    await memoryIndex.writeFragment(fragment2);

    const result = await memoryIndex.listFragments(ownerId, true);
    expect(result).toEqual([fragment1, fragment2]);
  });

  test('listFragments with empty result', async () => {
    const ownerId = 'fakeUser1';
    const result = await memoryIndex.listFragments(ownerId);
    // Expect an empty array of objects
    expect(result).toEqual([]);
  });  

  test('deleteFragment', async () => {
    const ownerId = 'user1';
    const fragmentId = 'fragment1';
    const buffer = Buffer.from('sample data');
    await memoryIndex.writeFragment({ ownerId, id: fragmentId });
    await memoryIndex.writeFragmentData(ownerId, fragmentId, buffer);

    await memoryIndex.deleteFragment(ownerId, fragmentId);

    const metadataResult = await memoryIndex.readFragment(ownerId, fragmentId);
    const dataResult = await memoryIndex.readFragmentData(ownerId, fragmentId);

    expect(metadataResult).toBeUndefined();
    expect(dataResult).toBeUndefined();
  });

  test('deleteFragment with non-existing fragment', async () => {
    const ownerId = 'user1';
    const fragmentId = 'nonexistent';
    // Adjusting the expectation to handle the rejected promise correctly
    await expect(memoryIndex.deleteFragment(ownerId, fragmentId)).rejects.toThrow(
      `missing entry for primaryKey=${ownerId} and secondaryKey=${fragmentId}`
    );
  });
});
