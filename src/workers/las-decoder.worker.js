import { readUsingDataView } from './las-decoder-worker-internal';

onmessage = readUsingDataView;
