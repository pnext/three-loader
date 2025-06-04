#include <emscripten/emscripten.h>
#include <iostream>

#ifdef __cplusplus
#define EXTERN extern "C"
#else
#define EXTERN
#endif


EXTERN EMSCRIPTEN_KEEPALIVE void sortIndexes(unsigned int* indexes, void* centers, int* mappedDistances, unsigned int * frequencies, float* modelViewProj,
                                             unsigned int* indexesOut, unsigned int distanceMapRange, unsigned int renderCount) {

    int maxDistance = -2147483640;
    int minDistance = 2147483640;

    unsigned int sortStart = 0;

    float* floatCenters = (float*)centers;
    float* fMVP = (float*)modelViewProj;

    for (unsigned int i = sortStart; i < renderCount; i++) {
        unsigned int indexOffset = 4 * (unsigned int)indexes[i];
        int distance = 
            (int)((fMVP[2] * floatCenters[indexOffset] +
                    fMVP[6] * floatCenters[indexOffset + 1] +
                    fMVP[10] * floatCenters[indexOffset + 2]) * 4096);
        mappedDistances[i] = distance;
        if (distance > maxDistance) maxDistance = distance;
        if (distance < minDistance) minDistance = distance;
    }
            
    float distancesRange = (float)maxDistance - (float)minDistance;
    float rangeMap = (float)(distanceMapRange - 1) / distancesRange;

    for (unsigned int i = sortStart; i < renderCount; i++) {
        unsigned int frequenciesIndex = (int)((float)(mappedDistances[i] - minDistance) * rangeMap);
        mappedDistances[i] = frequenciesIndex;
        frequencies[frequenciesIndex] = frequencies[frequenciesIndex] + 1;   
    }

    unsigned int cumulativeFreq = frequencies[0];
    for (unsigned int i = 1; i < distanceMapRange; i++) {
        unsigned int freq = frequencies[i];
        cumulativeFreq += freq;
        frequencies[i] = cumulativeFreq;
    }

    for (int i = (int)renderCount - 1; i >= (int)sortStart; i--) {
        unsigned int frequenciesIndex = mappedDistances[i];
        unsigned int freq = frequencies[frequenciesIndex];
        indexesOut[renderCount - freq] = indexes[i];
        frequencies[frequenciesIndex] = freq - 1;
    }
}
